import { Promise } from 'bluebird';
import uuid from 'uuid';
import _ from 'lodash';
let agent = require('superagent-promise')(require('superagent'), Promise);
import pointer from 'json-pointer';
import PouchDB from 'pouchdb';
let db_singleton = null;

let pouchPutNew = function(token, url) {
	if (token) {
    return agent('GET', url)
    .set('Authorization', 'Bearer '+ token)
    .end()
    .then(function(response) {
      if (response.body._id) {
      	//each rock
      	return cache.db().put({
          doc: response.body._id,
          _id: url, 
        }).then(function(result) {
          return cache.db().put({
            doc: response.body, 
            _id: response.body._id,
          }).then(function(res) {
            return response.body;
          }).catch(function(err) {
            console.log(err);
          })
        }).catch(function(err) {
          console.log(err);
        })
        //return response.body;
      } else {
      	return response.body;
      }
    }).catch(function(err) {
      if (err.status === 404) {
        return null;
      }
    });
  } else { return null;}
}

let pouchPutUpdate = function(token, url) {
	if (token) {
	  return agent('GET', url)
	  .set('Authorization', 'Bearer '+ token)
	  .end()
	  .then(function(response) {
	    if (response.body._id) {
	      return cache.db().put({
	        doc: response.body, 
	        _id: response.body._id,
	      }).then(function(res) {
	    	  return response.body;
	      }).catch(function(err) {
	    	  console.log(err);
	      })
	      
	    } else {
	  	  return response.body;
	    }
	  }).catch(function(err) {
	    if (err.status === 404) {
	      return null;
	    }
	  });
	} else { return null;}
}


let simplePut = function(resourcesUrl, bookmarksUrl, resData, bookData, token) {
  
  return agent('PUT', resourcesUrl + '/')
    .set('Authorization', 'Bearer '+ token)
    .send(resData)
    .end()
    .then((res) => {
      return agent('PUT', bookmarksUrl)
        .set('Authorization', 'Bearer '+ token)
        .send(bookData)
        .end()
    }).catch(function(err) {
      console.log(err)
      return err;
    })
}

let simpleResPut = function(url, data, token) {
  return agent('PUT', url + '/')
    .set('Authorization', 'Bearer '+ token)
    .send(data)
    .end()
    .then(() => {
    }).catch(function(err) {
      console.log(err)
      return err;
    })
}

let replaceLinks = function(desc, example) {
  let ret = (Array.isArray(example)) ? [] : {};
  if (!desc) return example;  // no defined descriptors for this level
  Object.keys(example).forEach(function(key, idx) {
    let val = example[key];
    if (typeof val !== 'object' || !val) {
      ret[key] = val; // keep it as-is
      return;
    }
    if (val._id) { // If it's an object, and has an '_id', make it a link from descriptor
      ret[key] = { _id: desc[key]._id, _rev: '0-0', _type: desc[key]._type };
      return;
    }
    ret[key] = replaceLinks(desc[key],val); // otherwise, recurse into the object looking for more links
  });
  return ret;
}

/* eslint-disable */
let handleStarSetup = function(subTree, serverId, keysArray){
  console.log('handleStarSetup', keysArray, subTree)
  return agent('GET', serverId.bookmarksUrl + pointer.compile(keysArray) + '/')
  .set('Authorization', 'Bearer '+ serverId.token)
  .end()
  .then(function(response) {
    if (response.body) {
      return Promise.mapSeries(Object.keys(response.body), (key) => {
        console.log('STAR - these are the keys', key)
        let cloneArray = _.clone(keysArray);
        cloneArray.push(key);
        return recursiveSetup(subTree['*'], serverId, cloneArray)
        .then((res) => {
          return appendResult(res, key)
        })
      })
    } else return []
  }).catch((err) => {
    return []
  })
}

let recursiveSetup = function(subTree, serverId, keysArray) {
  console.log('recursiveSetup', keysArray, subTree)
  return Promise.mapSeries(Object.keys(subTree), function(key) {
    console.log('Processing', key)
    // Encountered a *, fill out the tree with all keys at this position.
    if (key === '*') {
      return handleStarSetup(subTree, serverId, keysArray)
      .then((result) => {
      // Handling * requires a modified append step. We don't want to put the returned
      // result under the * key.
        console.log('STAR', result)
        let returnTree = {}
        result.forEach((item) => {
          Object.keys(item).forEach((k) => {
            returnTree[k] = item[k]
          }) 
        })
        return returnTree
      })
    }
    let content = subTree[key];
    if (typeof content === 'object') {
      let cloneArray = _.clone(keysArray);
      cloneArray.push(key);
      let url = serverId.bookmarksUrl + pointer.compile(keysArray) + '/' + key + '/';
      return agent('GET', url)
      .set('Authorization', 'Bearer '+ serverId.token)
      .end()
      .then((response) => {
        // content is empty, make sure if its a resource it gets created
        if (_.isEmpty(response.body)) {
          return createResource(content, key, serverId, keysArray)
          .then((result) => {
            console.log('11111111');
            // Now continue and try this step of the recursive setup over again.
            return recursiveSetup(content, serverId, cloneArray)
            .then((res) => {
              console.log('111 FALLING OUT -', key)
              console.log(res)
              return appendResult(res, key)
            })
          })
        }
        // Server already has content
        return recursiveSetup(content, serverId, cloneArray)
        .then((res) => {
          console.log('222 FALLING OUT -', key)
          console.log(res)
          return appendResult(res, key)
        })
      }).catch((error) => {
        // content wasn't on the server; replace links, create it (and continue recursion within)
        return createResource(content, key, serverId, keysArray)
        .then((result) => {
          console.log('333333')
          // Now continue and try this step of the recursive setup over again.
          return recursiveSetup(content, serverId, cloneArray)
          .then((res) => {
            console.log('333 FALLING OUT -', key)
            console.log(res)
            return appendResult(res, key)
          })
        })
      })
    } else {
      console.log('HERE')
      let obj = {};
      obj[key] = subTree[key]
      return obj
    }
// This is ultimately the return of the deepest recursions.
  })
}

let appendResult = (result, key) => {
  let returnTree = {}
  returnTree[key] = {}
  result.forEach((item) => {
    Object.keys(item).forEach((k, i) => {
      returnTree[key][k] = item[k]
    })
  })
  console.log('APPENDING', returnTree)
  return returnTree
}
        
let createResource = function(subTree, key, serverId, keysArray) {
  let resource = {}
  let bookmark = {};
  bookmark[key] = {};
// If its a resource (has _type), add _id and _rev to resource and bookmark,
// and PUT the resource
  return Promise.try(() => {
    if (subTree._type) {
      Object.keys(subTree).forEach((k) => {
        resource[k] = {}
      })
      resource['_id'] = uuid.v4();
      resource['_rev'] = '0-0';
      resource['_type'] = subTree._type;
      bookmark[key] = {
        _id: resource._id,
        _rev: resource._rev,
      }; 
      let resourceUrl = serverId.resourcesUrl + resource._id + '/';
      console.log('creating', key, 'resource', resource)
      console.log('creating', key, 'resource', resourceUrl)
      return agent('PUT', resourceUrl)
      .set('Authorization', 'Bearer '+ serverId.token)
      .send(resource)
      .end()
    } else return null
  }).then(() => {
    // Also add the bookmarks link
    let bookmarkUrl = serverId.bookmarksUrl + pointer.compile(keysArray) + '/';
    console.log('creating', key, 'bookmark', bookmark)
    console.log('creating', key, 'bookmark', bookmarkUrl)
    return agent('PUT', bookmarkUrl)
    .set('Authorization', 'Bearer '+ serverId.token)
    .send(bookmark)
    .end()
  })
}


let smartPutSetup = function(domain, token, pathArray, data, objKey, tree) {
  let temp = _.cloneDeep(tree);
  let treePointer = '/' + pathArray[0] + '/';
  let bookmarksUrl = 'https://'+domain+'/bookmarks/';
  let resourcesUrl = 'https://'+domain+'/resources/';
  return Promise.each(pathArray, function(pathElement, i) {
    temp = temp[pathElement]; 
    bookmarksUrl += pathElement + '/';
    let bookData;
    if (pathArray[i+1]) {
      if (temp['*']) {
        if (!temp[pathArray[i+1]]) {  //if end of object
          temp[pathArray[i+1]] = temp['*'];
          //Update keys to the tree
          pointer.set(tree, treePointer+pathArray[i+1], pathArray[i+1])
          treePointer += '*/';
          if (temp['*']._type) {
            //Generate a new resource id
            let id = uuid.v4();
            let resData = {
              _id: id,
              _rev: '0-0',
            };
            Object.keys(temp['*']).forEach(function(element) {
              resData[element] = {};
            })
            resData._type = temp['*']._type;
            bookData = {
              _id: resData._id,
              _rev: resData._rev
            };
            return simplePut(resourcesUrl+id, bookmarksUrl+pathArray[i+1]+'/', resData, bookData, token)
          } return false // Else no need to PUT anything, the server will make it an empty object
          //update 'corn' or 'indiana' to subTree
        } return false     
      } else {
        treePointer += pathArray[i+1] + '/';
        return false
      }
    } else {
      bookData = {};
      bookData[data.id] = {
        _id: data.id,
        _rev: '0-0'
      };
      return simplePut(resourcesUrl+objKey, bookmarksUrl, data, bookData, token)
    }
  }).catch(function(err) {
    return err;
  })
}

let putSetup = function(domain, token, bookmarksUrl, data, tree) {
	if (data.sync_status === 'new') {
    //New object
    return Promise.try(function() {
      // Assume easy situations without children resources
      // PUT to /resources
      //let resourcesUrl = 'https://' + domain + '/resources/';
      let objKey = bookmarksUrl.slice(-37, -1);  //Rock key!!
      let pathStr = bookmarksUrl.slice(8+domain.length, -38);
      let pathArray = pointer.parse(pathStr);
      pathArray.splice(0, 1);  //remove bookmarks
      return smartPutSetup(domain, token, pathArray, data, objKey, tree);
      }).then(() => {
	      return cache.get(bookmarksUrl, token).then(function() {
	  	    return true
	      })
      }).catch(function(err) {
        return err;
      })
  } else {
    //Update existing object
    //Put to existing resources
    let url = 'https://'+domain+'/resources/'+data.id+'/';
    return Promise.try(function() {
  	  return simpleResPut(url, data.update, token);
    }).then(() => {
  	  return cache.get(bookmarksUrl, token).then(function() {
  	    return true
      })
    })
  }
}

let cache = {
  
  get: function(url, token) {
    //get resource id from url
    return cache.db().get(url).then(function(resId) {
      //get resource
      return cache.db().get(resId.doc).then(function(content) {
        return content.doc;
      }).catch(function(err) {
      	return pouchPutUpdate(token, url);
      })
    // Perform an HTTP request to OADA 
    }).catch(function(err) {
      return pouchPutNew(token, url);
    })
  },

  delete: function(token, url) {
    return agent('DELETE', url)
    .set('Authorization', 'Bearer '+ token)
    .end()
  },

//check if there is a path with keys in each level
//If a key exists (GET the key), nothing
//If not, PUT to resources
  db: () => {
    if (!db_singleton) db_singleton = new PouchDB('TheRockApp', { size: 50 });
    return db_singleton;
  },

  put: function(domain, token, bookmarksUrl, data, tree) {
    //Delete pouch
    return cache.db().get(bookmarksUrl).then(function(resId) {
      return cache.db().get(resId.doc).then(function(content) {
        return cache.db().remove(content)
      }).then(function(){
        return putSetup(domain, token, bookmarksUrl, data, tree);
      }).catch(function(err) {
      	return err;
      })
    }).catch(function(err) {
      return putSetup(domain, token, bookmarksUrl, data, tree);
    })
  },

// setup takes the tree  object and recursively PUTS keys to the oada server. 
// Resources are created as necessary for objects that have a _type key.
  setup: function(domain, token, tree) {
    let resourcesUrl = 'https://' + domain + '/resources/';
    let bookmarksUrl = 'https://' + domain + '/bookmarks';
    let serverId = { domain: domain, token: token, resourcesUrl: resourcesUrl, bookmarksUrl: bookmarksUrl };
    return recursiveSetup(tree, serverId, []).then((res) => {
      console.log('FINAL', res)
      let returnTree = {}
      res.forEach((item) => {
        Object.keys(item).forEach((key, i) => {
          returnTree[key] = item[key]
        })
      })
      console.log('FINAL', returnTree)
      return returnTree
    })
  },
}
module.exports = cache;
