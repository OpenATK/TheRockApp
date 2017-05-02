import _ from 'lodash';
import oadaIdClient from 'oada-id-client';
import { Promise } from 'bluebird';  
import { set, toggle } from 'cerebral/operators';
import { props, state } from 'cerebral/tags'
import L from 'leaflet';
import db from '../Cache';
import cerebralCache from '../cerebral-module-oada-cache/chains/';
const getAccessToken = Promise.promisify(oadaIdClient.getAccessToken)

//var cerebralPath;

// Define tree structure for the oada server setup
var tree = {
  rocks: {
    _type: 'application/vnd.oada.rocks.1+json',
    'list-index': {
      '*': {
      },
    },
  },
  //testthree: {
    // 'list-index': {
    //   'indiana':{},
    //   'michigan':{}
    // }
  //},
};

var getRockData = [
  getToken, {
    success: [
      storeToken,
      set(props`cerebralPrefix`, ['app', 'oada-cache', 'bookmarks']),
      set(props`tree`, tree),
      cerebralCache.setup,  //setupOadaServer,
      //set(props`path`, 'rocks.list-index')
      cerebralCache.get,
//      setCerebralPath,
    ], 
    error: [],
  },
];

var getSyncStatus = [
  getSync, {
    success: [
      setSyncFailedStatus,
      updateFailedData, {
        success: [
          updateFailedNewRocks, {
            success: [set(state`app.model.rocks.${props`id`}.sync_status`, 'synced')],
            error: [set(state`app.model.rocks.${props`id`}.sync_status`, 'failed')],
          },
        ],
        error: [set(state`app.model.rocks.${props`id`}.sync_status`, 'failed')],
      },
    ],
    error: [],
  },
];

export var initialize = [
  getOadaDomain, {
    cached: [
      setOadaDomain,
      set(state`app.view.domain_modal.visible`, false),
      getRockData,
      // getSyncStatus
    ],
    offline: [],
  },
];

// generateNewID, 
// chain: oadaPut, (input.statepath (Optional), input.url, input.content),
//   set('app.model.rocks.data.id', data)
export var addRockLoc = [
  createNewRock, // Since generating new ID in cerebralCache, content does not contain id now
  createNewRockUrl,  //domain/bookmarks/rocks/list-index/
  ...[cerebralCache.post],
  // oadaPut, {
  // 	success: [
  // 	  setRockToState('app.model.rocks'),  //optional statePath
  //     set(state`app.model.rocks.${props`id`}.sync_status`, 'synced'),
  // 	],
  // 	error: [],
  // },
];

export var setNewRockLoc = [
  setRockLoc,
  set(state`app.oada-cache.bookmarks.rocks.list-index.${props`id`}.sync_status`, 'sent'),
  createNewLocation,
  ...[cerebralCache.put],
];

export var setRockPicked = [
  setPicked,
  createNewPickStatus,
  ...[cerebralCache.put],
];

export var hidePickedMarker = [
  toggle(state`app.view.show_all_rocks`),
];

export var getCurrentLocation = [
  setCurrentLocation,
];

export var showCurrentLocation = [
  setMapLocation,
];

export var getMapCenter = [
  setMapCenter,
  set(state`app.model.map_bounds`, props`bounds`),
  set(state`app.view.marker_edit_mode`, false),
];

export var initSetMapCenter = [
  setMapCenter,
];

export var showEdit = [
  set(state`app.view.marker_edit_mode`, true),
  set(state`app.model.selected_key`, props`id`),
  setRockComment,
];

export var setBounds = [
  set(state`app.model.map_bounds`, props`bounds`),
];

export var inputTextChanged = [
  set(state`app.model.comment_input`, props`value`),
];

export var addCommentText = [
  set(state`app.oada-cache.bookmarks.rocks.list-index.${props`id`}.comments`, props`text`),
  set(state`app.oada-cache.bookmarks.rocks.list-index.${props`id`}.sync_status`, 'sent'),
  createNewComment,
  ...[cerebralCache.put],
];

export var deleteRock = [
  ...[cerebralCache.delete],
  set(state`app.view.marker_edit_mode`, false),
];

export var displayDomainModal = [
  set(state`app.view.domain_modal.visible`, true),
];

export var updateRockData = [
  // sync button
  getSyncStatus,
];

export var removeGeohashes = [
  unregisterGeohashes,
];

export var addGeohashes = [
  registerGeohashes,
];

export var clearCache = [
  destroyCache,
];

export var submitDomainModal = [
  setOadaDomain,
  set(state`app.view.domain_modal.visible`, false),
  getRockData,
];

export var cancelDomainModal = [
  setOadaDomain,
  set(state`app.view.domain_modal.visible`, false),
];

export var updateDomainText = [
  set(state`app.view.domain_modal.text`, props`value`),
];

function getToken({props, state, path}) {
  return path.success({token:'VYKM5ZRaSEE_W-EzOyV978WjT0hRtKoKddou5R94'})
  return db().get('token').then(function(result) {
  	//console.log('found token in pouch')
    return path.success({token:result.doc.token});
  }).catch(function(err) { //not in Pouch, prompt for user sign in
  	//console.log('token not in pouch')
    if (err.status !== 404) console.log(err);
    var options = {
      metadata: 'eyJqa3UiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbS9jZXJ0cyIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vdHJpYWxzdHJhY2tlci5vYWRhLWRldi5jb20vb2F1dGgyL3JlZGlyZWN0Lmh0bWwiLCJodHRwOi8vbG9jYWxob3N0OjgwMDAvb2F1dGgyL3JlZGlyZWN0Lmh0bWwiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCJdLCJyZXNwb25zZV90eXBlcyI6WyJ0b2tlbiIsImlkX3Rva2VuIiwiaWRfdG9rZW4gdG9rZW4iXSwiY2xpZW50X25hbWUiOiJUcmlhbHMgVHJhY2tlciIsImNsaWVudF91cmkiOiJodHRwczovL2dpdGh1Yi5jb20vT3BlbkFUSy9UcmlhbHNUcmFja2VyIiwiY29udGFjdHMiOlsiU2FtIE5vZWwgPHNhbm9lbEBwdXJkdWUuZWR1PiJdLCJzb2Z0d2FyZV9pZCI6IjVjYzY1YjIwLTUzYzAtNDJmMS05NjRlLWEyNTgxODA5MzM0NCIsInJlZ2lzdHJhdGlvbl9wcm92aWRlciI6Imh0dHBzOi8vaWRlbnRpdHkub2FkYS1kZXYuY29tIiwiaWF0IjoxNDc1NjA5NTkwfQ.Qsve_NiyQHGf_PclMArHEnBuVyCWvH9X7awLkO1rT-4Sfdoq0zV_ZhYlvI4QAyYSWF_dqMyiYYokeZoQ0sJGK7ZneFwRFXrVFCoRjwXLgHKaJ0QfV9Viaz3cVo3I4xyzbY4SjKizuI3cwfqFylwqfVrffHjuKR4zEmW6bNT5irI',
      scope: 'rocks',
        "redirect": 'http://localhost:8000/oauth2/redirect.html',
    };
    var domain = state.get(['app', 'model', 'domain']);
    //console.log('firing oada login')
    return getAccessToken(domain, options).then((result)=> {
      console.log('returned from oada', result)
      return path.success({token:result.access_token});
    }).catch((err) => {
      console.dir(err); 
      return path.error(); // Something went wrong  
    })
  })
};

// function setCerebralPath({props, state}) {
//   console.log('setCerebralPath')
//   cerebralPath = props.cerebralPath;
//   console.log(cerebralPath)
// };

function storeToken({props, state}) {
  db().put({
    doc: {token: props.token},
    _id: 'token',
  }).catch(function(err) {
    if (err.status !== 409) throw err;
  });
  state.set(['app', 'token'], props.token);
  state.set('app.offline', false);
};

/*
function setupOadaServer({state}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  //var cerebralPath = ['app', 'model'];
  //var oadaPath = '/bookmarks/';
  //return cache.setup(domain, token);
  return oadaCache.setup(domain, token, tree);
};
*/
/*
function getAvailableData({state, path}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var url = 'https://' + domain + '/bookmarks/rocks/list-index/';
	var objData = {};
	return oadaCache.get(url, token).then(function(objIndex) {
    return Promise.map(Object.keys(objIndex), function(key) {
      return oadaCache.get(url + key + '/', token).then(function(objItem) {
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
*/
/*
function setAvailableData({props, state, path}) {
	Object.keys(props.objData).forEach(function(objKey) {
    state.set(['app', 'model', 'rocks', objKey], props.objData[objKey]);
  })
};
*/
// function deleteRockDataRes({props, state, path}) {
// 	console.log("delete rock resources in the server");
//   var token = state.get(['app', 'token']);
//   var domain = state.get(['app', 'model', 'domain']);
//   var url = 'https://' + domain + '/resources/' + props.id + '/';
//   return oadaCache.delete(token, url).then(function() {
//     return path.success({});
//   }).catch(function(err) {
//   	console.log(err)
//   	return err;
//   })
// };

// function deleteRockDataBookmark({props, state, path}) {
//   console.log("delete rock bookmark in the server");
//   var token = state.get(['app', 'token']);
//   var domain = state.get(['app', 'model', 'domain']);
//   var url = 'https://' + domain + '/bookmarks/rocks/list-index/' + props.id + '/';
//   return oadaCache.delete(token, url).then(function() {
//     return path.success({});
//   }).catch(function(err) {
//   	console.log(err)
//   	return err;
//   })
// };

function setRockComment({props, state}) {
  var selectedRockComment = state.get(['app', 'oada-cache','bookmarks', 'rocks', 'list-index', props.id, 'comments']);
  state.set(['app', 'model', 'comment_input'], selectedRockComment);
};

// function addCommentRock({props, state}) {
//   state.set(['app', 'model', 'rocks', props.id, 'comments'], props.text);
// };

// function setInputValue({props, state}) {
//   state.set(['app', 'model', 'comment_input'], props.value);
// };

// function updateBounds({props, state}) {
//   state.set(['app', 'model', 'map_bounds'], props.bounds);
// };

// function showEditPanel({props, state}) {
//   state.set(['app', 'view', 'marker_edit_mode'], true);
//   state.set(['app', 'model', 'selected_key'], props.id);
// };

// function hideEditPanel({state}) {
//   state.set(['app', 'view', 'marker_edit_mode'], false);
// };

function setMapCenter({props, state}) {
  //console.log('setMapCenter')
  //console.log(props)
  var obj = {
    lat: props.lat,
    lng: props.lng,
  }
  state.set(['app', 'model', 'map_center_location'], obj);
};

function setMapLocation({state}) {
  var currentLat = state.get(['app', 'model', 'current_location', 'lat']);
  var currentLng = state.get(['app', 'model', 'current_location', 'lng']);
  var obj = {
    lat: currentLat,
    lng: currentLng,
  }
  if (currentLat) {
    state.set(['app', 'model', 'map_center_location'], obj);
    state.set(['app', 'view', 'current_location_toggle'], true);
  }
};

function setCurrentLocation({props, state}) {
  var obj = {
    lat: props.lat,
    lng: props.lng,
  }
  state.set(['app', 'model', 'current_location'], obj);
  state.set(['app', 'view', 'current_location_state'], true);
};

// function toggleShowRock({state}) {
//   var showAll = state.get(['app', 'view', 'show_all_rocks']);
//   state.set(['app', 'view', 'show_all_rocks'], !showAll);
// };

function setPicked({state, path}) {
  var selectedRock = state.get(['app', 'model', 'selected_key']);
  var picked = state.get(['app', 'model', 'rocks', selectedRock, 'picked']);
  if (!picked) {
    state.set(['app', 'model', 'rocks', selectedRock, 'picked'], true);
    state.set(['app', 'view', 'rock_pick_state'], true);
  } else {
    state.set(['app', 'model', 'rocks', selectedRock, 'picked'], false);
    state.set(['app', 'view', 'rock_pick_state'], false);
  };
  return {id: selectedRock}
};

function createNewPickStatus({props, state, path}) {
  console.log("sync pick status");
  var picked = state.get(['app', 'model', 'rocks', props.id, 'picked']);
  var data = {
    id: props.id,
    update: {
      picked: picked,
    }
  };
  return {content: data}
};

function setRockLoc({props, state}) {
  //console.log(props.lat)
  var newLocation = {
    latitude: props.lat,
    longitude: props.lng,
  };
  //state.set(['app', 'model', 'rocks', props.id, 'location'], newLocation);
  state.set(['app', 'oada-cache', 'bookmarks', 'rocks', 'list-index', props.id, 'location'], newLocation);
};

/*
function setSyncSent({props, state}) {
  state.set(['app', 'model', 'rocks', props.id, 'sync_status'], "sent");
};

function setSynced({props, state}) {
  state.set(['app', 'model', 'rocks', props.id, 'sync_status'], "synced");
};

function setFailed({props, state}) {
  state.set(['app', 'model', 'rocks', props.id, 'sync_status'], "failed");
};
*/

function createNewLocation({props, state, path}) {
  console.log("!!!update new location!!!");
  var data = {
    id: props.id,
    update: {
      location: {
        latitude: props.lat,
        longitude: props.lng
      },
    },
  }
  return {content: data}
};

function createNewRock({props, state, path}) {
  var currentLocState = state.get(['app', 'view', 'current_location_state']);
  var obj;
  if (currentLocState === false) {
    obj = {
      //id: props.id,
      location: {
        latitude: props.lat,
        longitude: props.lng,
      },
      picked: false,
      comments: '',
      sync_status: 'new',
    };
  } else {
    var mapBounds = state.get(['app', 'model', 'map_bounds']);
    var currentLat = state.get(['app', 'model', 'current_location', 'lat']); 
    var currentLng = state.get(['app', 'model', 'current_location', 'lng']);
    obj = {
      //id: props.id,
      location: {
        latitude: currentLat,
        longitude: currentLng,
      },
      picked: false,
      comments: '',
      sync_status: 'new',
    };
    var bounds = L.latLngBounds(mapBounds._southWest, mapBounds._northEast);
    var currentLocation = L.latLng(obj.location.latitude, obj.location.longitude);
    if (bounds.contains(currentLocation)) {
    } else {
      state.set(['app', 'model', 'map_center_location', 'lat'], obj.location.latitude);
      state.set(['app', 'model', 'map_center_location', 'lng'], obj.location.longitude);
      state.set(['app', 'view', 'current_location_toggle'], true);
    }
  }
  return {content: obj}
};

function createNewRockUrl({props, state, path}) {
  var domain = state.get(['app', 'model', 'domain']);
	var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/';
	return {bookmarksUrl}
}

function createNewComment({props, state, path}) {
  console.log("update comment data");
  var data = {
    id: props.id,
    update: {
      comments: props.text,
    }
  };
  return {content: data}
};

function getSync({props, state, path}) {
  var syncFailed = {};
  var syncNew = {};
  var rocksData = state.get(['app', 'model', 'rocks']);
  syncFailed = _.filter(rocksData, ['sync_status', 'failed']);
  syncNew = _.filter(rocksData, ['sync_status', 'new']);
  return path.success({syncFailed:syncFailed, syncNew:syncNew});
};

function setSyncFailedStatus({props, state}) {
  state.set(['app', 'model', 'sync_failed'], props.syncFailed);
  state.set(['app', 'model', 'sync_new'], props.syncNew);
};

function updateFailedData({props, state, path}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var resourcesUrl = 'https://' + domain + '/resources/';
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/';
  props.syncFailed.forEach(function(failedRock) {
    return cerebralCache.put(token, resourcesUrl, bookmarksUrl, failedRock.id, failedRock).then(function() {
      var syncUrl = 'https://' + domain + '/resources/' + failedRock.id + '/sync_status/';
      return cerebralCache.delete(token, syncUrl).then(function() {
        return path.success({});
      }).catch(function(err) {
      	console.log(err)
      	return err;
      })
    }).catch(function(err) {
    	console.log(err)
    	return err;
    })
  })
};

function updateFailedNewRocks({props, state, path}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var resourcesUrl = 'https://' + domain + '/resources/';
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/';
  //PUT new rock to resources and bookmark if not synced yet
  if (props.syncNew) {
    console.log("PUT new rock to bookmark!!!")
    props.syncNew.forEach(function(newRock) {
      return cerebralCache.put(token, resourcesUrl, bookmarksUrl, newRock.id, newRock).then(function() {
        var syncUrl = 'https://' + domain + '/resources/' + newRock.id + '/sync_status/';
        return cerebralCache.delete(token, syncUrl).then(function() {
          return path.success({});
        }).catch(function(err) {
		    	console.log(err)
		    	return err;
		    })
      }).catch(function(err) {
	    	console.log(err)
	    	return err;
	    })
    })
  }
};

function getOadaDomain({state, path}) {
  //First, check if the domain is already in the cache;
  return db().get('domain').then(function(result) {
    if (result.doc.domain.indexOf('offline') > 0) {
      return path.offline({}); //In cache, but not connected to server for now
    } else {
      return path.cached({value: result.doc.domain});//In cache, use it. 
    }
  }).catch(function(err) {
    console.log(err);
    if (err.status !== 404) throw err;
    return path.offline({});//Don't have it yet, prompt for it. 
  })
};

function setOadaDomain({props, state}) {
  state.set(['app', 'model', 'domain'], props.value);
  db().put({
    doc: {domain: props.value},
    _id: 'domain',
  }).catch(function(err) {
    if (err.status !== 409) throw err;
  })
};

function destroyCache() {
  return db().destroy();
};

function registerGeohashes({props, state}) {
// This case occurs before a token is available. Just save all geohashes and
// filter them later with filterGeohashesOnScreen when the list of available
// geohashes becomes known.
  props.geohashes.forEach((geohash) => {
    state.set(['app', 'model', 'geohashes_on_screen'], geohash)
  })
}

function unregisterGeohashes({props, state}) {
  props.geohashesToRemove.forEach((geohash) => {
    state.unset(['app', 'model', 'geohashes_on_screen', geohash]);
  });
};

// function showDomainModal({state}) {
//   state.set(['app', 'view', 'domain_modal', 'visible'], true);
// };

// function hideDomainModal({state}) {
//   state.set(['app', 'view', 'domain_modal', 'visible'], false);
// };

// function setDomainText({props, state}) {
//   state.set(['app', 'view', 'domain_modal', 'text'], props.value)
// };
