import { Promise } from 'bluebird';
import oadaCache from './cache.js';
import { set, unset } from 'cerebral/operators';
import { state, props } from 'cerebral/tags';
import uuid from 'uuid';
var pointer = require('json-pointer');

//configuration argument passed in
//var cerebralPrefix = ['app', 'oada-cache', 'bookmarks'];
var cerebralPrefix;
var cerebralPath;
var tree;

var cerebralCache = {
  
  setup: [
    set(props`token`, state`app.token`),  //var token = state.get(['app', 'token']);
    set(props`domain`, state`app.model.domain`),  //var domain = state.get(['app', 'model', 'domain']);
    oadaSetup,
    cerebralSetup,
//    getAvailableData,
//  setAvailableData
  ],
//cerebralCache.get('app.oada-cache.bookmarks.rocks.list-index')
  get: [
    set(props`token`, state`app.token`),
    set(props`domain`, state`app.model.domain`),
    createUrl,
    oadaGet, {
      success: [setAvailableData],
      error: [],
    },
  ],

  put: [
    //set(state`app.oada-cache.bookmarks.rocks.list-index.${props`id`}.sync_status`, 'sent'),
    set(props`token`, state`app.token`),
    set(props`domain`, state`app.model.domain`),
    //set(props`bookmarksUrl`, `https://${props`domain`}/bookmarks/rocks/list-index/${props`id`}/`),
    createBookmarksUrl,
    getPathFromUrl,
    prepareBookmarksUrl,
    oadaPut, {
      success: [
        set(state`${props`statePath`}.sync_status`, 'synced'),
      ],
      error: [
        set(state`${props`statePath`}.sync_status`, 'failed'),
      ],
    },
  ],

  post: [
    generateNewId,
    set(props`token`, state`app.token`),
    set(props`domain`, state`app.model.domain`),
    createBookmarksUrl,
    //set(props`url`, `/rocks/list-index/${props`id`}`),
    getPathFromUrl,  //return {statePath} //[oada-cache, bookmarks, rocks, list-index, ID]
    //TODO: putSetup recursively make sure the state is in place before putting to a deep location
    oadaPut, {
      success: [
        set(state`${props`statePath`}`, props`content`),
        set(state`${props`statePath`}.sync_status`, 'synced'),
      ],
      error: [],  //keep status 'new'
    },

  ],

  delete: [
    set(state`app.model.rocks.${props`id`}.sync_status`, 'sent'),
    set(props`token`, state`app.token`),
    set(props`domain`, state`app.model.domain`),
    set(props`resourcesUrl`, `https://${props`domain`}/resources/${props`id`}/`),
    set(props`bookmarksUrl`, `https://${props`domain`}/bookmarks/rocks/list-index/${props`id`}/`),
    oadaResourceDelete, {
      success: [
        oadaBookmarkDelete, {
          success: [
            set(state`app.model.rocks.${props`id`}.sync_status`, 'synced'),
            unset(state`app.model.rocks.${props`id`}`),
          ],
          error: [set(state`app.model.rocks.${props`id`}.sync_status`, 'failed')],
        },
      ],
      error: [set(state`app.model.rocks.${props`id`}.sync_status`, 'failed')],
    },
  ],
}
module.exports = cerebralCache;

//Setup
function oadaSetup({props, state}) {
  console.log('oadaSetup')
  tree = props.tree;  //making it global variable for the rest of functions
  return oadaCache.setup(props.domain, props.token, tree);
};



var recursiveSetup = function(domain, subTree, keysArray, {state}) {
  return Promise.each(Object.keys(subTree), function(key, i) {
    console.log('!!!recursive starts!!!')
    console.log(key)

    if (key === '*') {
      console.log('* found!!!')
      
      //TODO: check pouchdb and if star keys available, push to keysArray
      console.log(keysArray)
      cerebralPath = keysArray;  //assign to global variable (last step)
      return cerebralPath;
    }
    var content = subTree[key];
    if (typeof content === 'object') {  //rocks and list-index
      keysArray.push(key);
      console.log(keysArray)

      keysArray.forEach((item) => {
		  	if (!state.get(keysArray)) {
		  		state.set(keysArray, {})
		  	}
		  })

      return recursiveSetup(domain, content, keysArray, {state});
    } else return null;
  }).then(function() {
    console.log('!!!recursiveSetup done!!!');
  }).catch(function(err) {
    console.log(err)
    return err;
  })
}

function cerebralSetup({props, state}) {
  console.log('cerebralSetup')
  cerebralPrefix = props.cerebralPrefix;  //make it global variable for the rest of functions

  //prefix setup
  var prefix = [];
  //console.log(cerebralPrefix)
  cerebralPrefix.forEach((item) => {
  	//console.log(item)
  	prefix.push(item)
  	//console.log(state.get(prefix))
  	if (!state.get(prefix)) {
  		//undefined: not in state tree
  		//console.log(prefix)
  		state.set(prefix, {})
  	}
  })

  var keysArray = cerebralPrefix.slice();  //copy
  var domain = props.domain;
  return recursiveSetup(domain, tree, keysArray, {state});
}

//Get
function createUrl({props, state, path}) {
  var url = 'https://' + props.domain + '/bookmarks/rocks/list-index/'
  return {url}
}

function oadaGet({props, state, path}) {
  var objData = {};
  //console.log(props.url)
  return oadaCache.get(props.url, props.token).then(function(objIndex) {
    return Promise.map(Object.keys(objIndex), function(key) {
      return oadaCache.get(props.url + key + '/', props.token).then(function(objItem) {
        return objData[key] = objItem;
      })
    })
  }).then(function() {
    return path.success({objData})
  }).catch(function(err) {
    console.log(err)
    return err;
  })
};

function setAvailableData({props, state, path}) {
  console.log('setAvailableData')
  //console.log(cerebralPath)
  Object.keys(props.objData).forEach(function(objKey) {
    var cerebralTarget = cerebralPath.slice(); //copy cerebralPath
    //console.log(cerebralTarget)
    //console.log(objKey)
    cerebralTarget.push(objKey)
    //console.log(cerebralTarget)
    state.set(cerebralTarget, props.objData[objKey]);
  })
};

//Put


//Post
function generateNewId({state, path}) {
  var id = uuid.v4();
  return {id}
};

function createBookmarksUrl({props, state, path}) {
  var url = '/rocks/list-index/' + props.id;
  return {url}
};

function prepareBookmarksUrl({props, state, path}) {
  var bookmarksUrl = 'https://'+props.domain+'/bookmarks/rocks/list-index/';
//  set(props`bookmarksUrl`, `https://${props`domain`}/bookmarks/rocks/list-index/${props`id`}/`),
  return {bookmarksUrl}
};

function getPathFromUrl({props, state, path}) {
  //if (last element == '/') then remove '/' and pointer.parse
  //else pointer.parse
  var pathArray = pointer.parse(props.url);  //[rocks, list-index, ID]
  //console.log(pathArray)
  //console.log(cerebralPrefix)
  //var pieces = cerebralPrefix.split('.');
  //console.log(pieces)
  var tempPath = cerebralPrefix.concat(pathArray);
  //console.log(cerebralPrefix)

  //conversion from array to string
  var strTemp = tempPath.join();
  //console.log(strTemp)
  var statePath = strTemp.replace(/,/g, '.');
  //console.log(newStr)

  //console.log(statePath)
  return {statePath} //oada-cache.bookmarks.rocks.list-index.ID
};

function oadaPut({props, state, path}) {
  //console.log(props.bookmarksUrl)
  var bookmarksUrl = props.bookmarksUrl+props.id+'/';
  var content = props.content;
  var id = props.id;
  content.id = id;
  //props.content.props.id = props.id;
  //console.log(content)
  //console.log(bookmarksUrl)
  return oadaCache.put(props.domain, props.token, bookmarksUrl, content, tree).then(function() {
    return path.success();
  }).catch(function(err) {
    console.log(err)
    return err;
  })
};

//Delete
function oadaResourceDelete({props, state, path}) {
  console.log("delete rock resources in the server");
  return oadaCache.delete(props.token, props.resourcesUrl).then(function() {
    return path.success({});
  }).catch(function(err) {
    console.log(err)
    return err;
  })
};

function oadaBookmarkDelete({props, state, path}) {
  console.log("delete rock bookmark in the server");
  return oadaCache.delete(props.token, props.bookmarksUrl).then(function() {
    return path.success({});
  }).catch(function(err) {
    console.log(err)
    return err;
  })
};


