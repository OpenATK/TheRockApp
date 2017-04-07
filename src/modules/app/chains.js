import uuid from 'uuid';
import request from 'superagent';
import _ from 'lodash';
import geolib from 'geolib';
import md5 from 'md5';
import oadaIdClient from 'oada-id-client';
import { Promise } from 'bluebird';  
var agent = require('superagent-promise')(require('superagent'), Promise);
import PouchDB from 'pouchdb';
import cache from './cache.js';
import { LatLngBounds } from 'react-leaflet';
import { set, unset, copy, toggle } from 'cerebral/operators';
import db from '../Cache'

var getRockData = [
  getToken, {
    success: [
      storeToken,
      setupOadaServer,
      getAvailableData, {
        success: [setAvailableData],
        error: [],
      },
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
            success: [setSynced],
            error: [setFailed],
          },
        ],
        error: [setFailed],
      },
    ],
    error: [],
  },
];

export var initialize = [
  getOadaDomain, {
    cached: [setOadaDomain, hideDomainModal, getRockData, getSyncStatus],
    offline: [],
  },
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
  setOadaDomain, hideDomainModal, getRockData,
];

export var cancelDomainModal = [
  setOadaDomain, hideDomainModal,
];

export var updateDomainText = [
  setDomainText,
];

export var addRockLoc = [
  pushNewRock,
  updateNewRockData, {
  	success: [setSynced],
    error: [], //keep 'new' status
  },
];

export var setNewRockLoc = [
  setRockLoc,
  setSyncSent,
  updateLocationData, {
    success: [setSynced],
    error: [setFailed],
  },
];

export var setRockPicked = [
  setPicked,
  setSyncSent,
  updatePickStatusData, {
  	success: [setSynced],
    error: [setFailed],
  },
];

export var hidePickedMarker = [
  toggleShowRock,
];

export var getCurrentLocation = [
  setCurrentLocation,
];

export var showCurrentLocation = [
  setMapLocation,
];

export var getMapCenter = [
  setMapCenter, updateBounds, hideEditPanel,
];

export var showEdit = [
  showEditPanel, setRockComment,
];

export var setBounds = [
  updateBounds,
];

export var inputTextChanged = [
  setInputValue,
];

export var addCommentText = [
  addCommentRock,
  setSyncSent,
  updateCommentData, {
  	success: [setSynced],
  	error: [setFailed],
  },
];

export var deleteRock = [
  setSyncSent,
  deleteRockDataRes, {
  	success: [
  	  deleteRockDataBookmark, {
  	    success: [setSynced, removeRock],
  	    error: [setFailed],
  	  },
  	],
  	error: [setFailed],
  },
  hideEditPanel,
];

export var displayDomainModal = [
  showDomainModal,
];

export var updateRockData = [
  // sync button
  getSyncStatus,
];

function setupOadaServer({input, state}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  return cache.setup(domain, token);
};

function removeRock({input, state}) {
  state.unset(['app', 'model', 'rocks', input.id]);
};

function deleteRockDataRes({input, state, output}) {
  console.log("delete rock resources in the server");
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var url = 'https://' + domain + '/resources/' + input.id + '/';

  return cache.delete(token, url).then(function() {
    output.success({});
  })
};
deleteRockDataRes.async = true;
deleteRockDataRes.outputs = ['success', 'error'];

function deleteRockDataBookmark({input, state, output}) {
  console.log("delete rock bookmark in the server");
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var url = 'https://' + domain + '/bookmarks/rocks/list-index/' + input.id + '/';
  return cache.delete(token, url).then(function() {
    output.success({});
  })
};
deleteRockDataBookmark.async = true;
deleteRockDataBookmark.outputs = ['success', 'error'];

function setRockComment({input, state}) {
  var selectedRockComment = state.get(['app', 'model', 'rocks', input.id, 'comments']);
  state.set(['app', 'model', 'comment_input'], selectedRockComment);
};

function addCommentRock({input, state}) {
  state.set(['app', 'model', 'rocks', input.id, 'comments'], input.text);
};

function setInputValue({input, state}) {
  state.set(['app', 'model', 'comment_input'], input.value);
};

function updateBounds({input, state}) {
  state.set(['app', 'model', 'map_bounds'], input.bounds);
};

function showEditPanel({input, state}) {
  state.set(['app', 'view', 'marker_edit_mode'], true);
  state.set(['app', 'model', 'selected_key'], input.id);
};

function hideEditPanel({state}) {
  state.set(['app', 'view', 'marker_edit_mode'], false);
};

function setMapCenter({input, state}) {
  var obj = {
    lat: input.lat,
    lng: input.lng,
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

function setCurrentLocation({input, state}) {
  var obj = {
    lat: input.lat,
    lng: input.lng,
  }
  state.set(['app', 'model', 'current_location'], obj);
  state.set(['app', 'view', 'current_location_state'], true);
};

function toggleShowRock({state}) {
  var showAll = state.get(['app', 'view', 'show_all_rocks']);
  state.set(['app', 'view', 'show_all_rocks'], !showAll);
};

function setPicked({state, output}) {
  var selectedRock = state.get(['app', 'model', 'selected_key']);
  var picked = state.get(['app', 'model', 'rocks', selectedRock, 'picked']);
  if (!picked) {
    state.set(['app', 'model', 'rocks', selectedRock, 'picked'], true);
    state.set(['app', 'view', 'rock_pick_state'], true);
  } else {
    state.set(['app', 'model', 'rocks', selectedRock, 'picked'], false);
    state.set(['app', 'view', 'rock_pick_state'], false);
  };
  output({id: selectedRock});
};

function updatePickStatusData({input, state, output}) {
  console.log("sync pick status");
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  //var url = 'https://' + domain + '/resources/';
  //var resourcesUrl = 'https://' + domain + '/resources/';
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/' + input.id + '/';
  var picked = state.get(['app', 'model', 'rocks', input.id, 'picked']);
  var data = {
    id: input.id,
    update: {
      picked: picked,
    }
  };
  return cache.put(domain, token, bookmarksUrl, data).then(function() {
    output.success({});
  })

};
updatePickStatusData.async = true;
updatePickStatusData.outputs = ['success', 'error'];

function setRockLoc({input, state}) {
  var newLocation = {
    latitude: input.lat,
    longitude: input.lng,
  };
  state.set(['app', 'model', 'rocks', input.id, 'location'], newLocation);
};

function setSyncSent({input, state}) {
  state.set(['app', 'model', 'rocks', input.id, 'sync_status'], "sent");
};

function setSynced({input, state}) {
  state.set(['app', 'model', 'rocks', input.id, 'sync_status'], "synced");
};

function setFailed({input, state}) {
  state.set(['app', 'model', 'rocks', input.id, 'sync_status'], "failed");
};

function updateLocationData({input, state, output}) {
  console.log("!!!update new location!!!");
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  //var url = 'https://' + domain + '/resources/';
  //var resourcesUrl = 'https://' + domain + '/resources/';
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/'+input.id+'/';
  //var syncUrl = 'https://' + domain + '/resources/' + input.id + '/sync_status/';  
  var data = {
    id: input.id,
    update: {
      location: {
        latitude: input.lat,
        longitude: input.lng
      },
    },
  }
  
  return cache.put(domain, token, bookmarksUrl, data).then(function() {
    output.success({});
  })

};
updateLocationData.async = true;
updateLocationData.outputs = ['success', 'error'];

function pushNewRock({input, state, output}) {
  var id = uuid.v4();
  var currentLocState = state.get(['app', 'view', 'current_location_state']);
  //var obj;

  if (currentLocState == false) {
    var obj = {
      id: id,
        location: {
          latitude: input.lat,
          longitude: input.lng,
        },
      picked: false,
      comments: '',
      sync_status: 'new',
    };
  } else {
    var mapBounds = state.get(['app', 'model', 'map_bounds']);
    var currentLat = state.get(['app', 'model', 'current_location', 'lat']); 
    var currentLng = state.get(['app', 'model', 'current_location', 'lng']);
    var obj = {
      id: id,
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
  state.set(['app', 'model', 'rocks', id], obj);
  output({newRock: obj, id: obj.id});
};

function updateNewRockData({input, state, output}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/' + input.id + '/';
//  var testBookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/corn/index-test1/indiana/index-test2/' + input.id + '/';
  var syncUrl = 'https://' + domain + '/resources/' + input.id + '/sync_status/';
  return cache.put(domain, token, bookmarksUrl, input.newRock).then(function(res) {
    return cache.delete(token, syncUrl);
  }).then(function() {
    output.success({});
  })
};
updateNewRockData.async = true;
updateNewRockData.outputs = ['success', 'error'];

function updateCommentData({input, state, output}) {
  console.log("update comment data");
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/' + input.id + '/';
  var data = {
    id: input.id,
    update: {
      comments: input.text,
    }
  };
  return cache.put(domain, token, bookmarksUrl, data).then(function() {
    output.success({});
  })

};
updateCommentData.async = true;
updateCommentData.outputs = ['success', 'error'];

function getAvailableData({state, output}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var url = 'https://' + domain + '/bookmarks/rocks/list-index/';
  var rocks = {};
  return cache.get(url, token).then(function(rocksIndex) {
    return Promise.each(Object.keys(rocksIndex), function(key) {
      return cache.get(url + key + '/', token).then(function(rockItem) {
        return rocks[key] = rockItem;
      })
    })
  }).then(function() {
    output.success({rocks});
  })
}
getAvailableData.outputs = ['success', 'error'];
getAvailableData.async = true;

function setAvailableData({input, state}) {
  Object.keys(input.rocks).forEach(function(rock) {
  	state.set(['app', 'model', 'rocks', rock], input.rocks[rock]);
  })
};

function getSync({input, state, output}) {
  var syncFailed = {};
  var syncNew = {};
  var rocksData = state.get(['app', 'model', 'rocks']);
  syncFailed = _.filter(rocksData, ['sync_status', 'failed']);
  syncNew = _.filter(rocksData, ['sync_status', 'new']);
  output.success({syncFailed});
  output.success({syncNew});
};
getSync.outputs = ['success', 'error'];
getSync.async = true;

function setSyncFailedStatus({input, state}) {
  state.set(['app', 'model', 'sync_failed'], input.syncFailed);
  state.set(['app', 'model', 'sync_new'], input.syncNew);
};

function updateFailedData({input, state}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var resourcesUrl = 'https://' + domain + '/resources/';
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/';
  input.syncFailed.forEach(function(failedRock) {
    return cache.put(token, resourcesUrl, bookmarksUrl, failedRock.id, failedRock).then(function() {
      var syncUrl = 'https://' + domain + '/resources/' + failedRock.id + '/sync_status/';
      return cache.delete(token, syncUrl).then(function() {
        output.success({});
      })
    })
  })
};
updateFailedData.outputs = ['success', 'error'];
updateFailedData.async = true;

function updateFailedNewRocks({input, state}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var resourcesUrl = 'https://' + domain + '/resources/';
  var bookmarksUrl = 'https://' + domain + '/bookmarks/rocks/list-index/';
  //PUT new rock to resources and bookmark if not synced yet
  if (input.syncNew) {
    console.log("PUT new rock to bookmark!!!")
    input.syncNew.forEach(function(newRock) {
      return cache.put(token, resourcesUrl, bookmarksUrl, newRock.id, newRock).then(function() {
        var syncUrl = 'https://' + domain + '/resources/' + newRock.id + '/sync_status/';
        return cache.delete(token, syncUrl).then(function() {
          output.success({});
        })
      })
    })
  }
};
updateFailedNewRocks.outputs = ['success', 'error'];
updateFailedNewRocks.async = true;

function getOadaDomain({state, output}) {
  //First, check if the domain is already in the cache;
  db().get('domain').then(function(result) {
    if (result.doc.domain.indexOf('offline') > 0) {
      output.offline({}); //In cache, but not connected to server for now
    } else {
      output.cached({value: result.doc.domain});//In cache, use it. 
    }
  }).catch(function(err) {
    console.log(err);
    if (err.status !== 404) throw err;
    output.offline({});//Don't have it yet, prompt for it. 
  })
};
getOadaDomain.outputs = ['cached', 'offline'];
getOadaDomain.async = true;

function setOadaDomain({input, state}) {
  state.set(['app', 'model', 'domain'], input.value);
  db().put({
    doc: {domain: input.value},
    _id: 'domain',
  }).catch(function(err) {
    if (err.status !== 409) throw err;
  })
};

function destroyCache() {
  return db().destroy();
};

function registerGeohashes({input, state}) {
// This case occurs before a token is available. Just save all geohashes and
// filter them later with filterGeohashesOnScreen when the list of available
// geohashes becomes known.
  input.geohashes.forEach((geohash) => {
    state.set(['app', 'model', 'geohashes_on_screen'], geohash)
  })
}

function unregisterGeohashes({input, state}) {
  input.geohashesToRemove.forEach((geohash) => {
    state.unset(['app', 'model', 'geohashes_on_screen', geohash]);
  });
};

function getToken({input, state, output}) {
  var self = this;
  db().get('token').then(function(result) {
    output.success({token:result.doc.token});
  }).catch(function(err) { //not in Pouch, prompt for user sign in
    if (err.status !== 404) console.log(err);
    var options = {
      metadata: 'eyJqa3UiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbS9jZXJ0cyIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vdHJpYWxzdHJhY2tlci5vYWRhLWRldi5jb20vb2F1dGgyL3JlZGlyZWN0Lmh0bWwiLCJodHRwOi8vbG9jYWxob3N0OjgwMDAvb2F1dGgyL3JlZGlyZWN0Lmh0bWwiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCJdLCJyZXNwb25zZV90eXBlcyI6WyJ0b2tlbiIsImlkX3Rva2VuIiwiaWRfdG9rZW4gdG9rZW4iXSwiY2xpZW50X25hbWUiOiJUcmlhbHMgVHJhY2tlciIsImNsaWVudF91cmkiOiJodHRwczovL2dpdGh1Yi5jb20vT3BlbkFUSy9UcmlhbHNUcmFja2VyIiwiY29udGFjdHMiOlsiU2FtIE5vZWwgPHNhbm9lbEBwdXJkdWUuZWR1PiJdLCJzb2Z0d2FyZV9pZCI6IjVjYzY1YjIwLTUzYzAtNDJmMS05NjRlLWEyNTgxODA5MzM0NCIsInJlZ2lzdHJhdGlvbl9wcm92aWRlciI6Imh0dHBzOi8vaWRlbnRpdHkub2FkYS1kZXYuY29tIiwiaWF0IjoxNDc1NjA5NTkwfQ.Qsve_NiyQHGf_PclMArHEnBuVyCWvH9X7awLkO1rT-4Sfdoq0zV_ZhYlvI4QAyYSWF_dqMyiYYokeZoQ0sJGK7ZneFwRFXrVFCoRjwXLgHKaJ0QfV9Viaz3cVo3I4xyzbY4SjKizuI3cwfqFylwqfVrffHjuKR4zEmW6bNT5irI',
      scope: 'rocks',
        "redirect": 'http://localhost:8000/oauth2/redirect.html',
    };
    var domain = state.get(['app', 'model', 'domain']);
    oadaIdClient.getAccessToken(domain, options, function(err, accessToken) {
      if (err) { console.dir(err); output.error(); } // Something went wrong  
      output.success({token:accessToken.access_token});
    });
  })
};
getToken.outputs = ['success', 'error'];
getToken.async = true;

function storeToken({input, state}) {
  db().put({
    doc: {token: input.token},
    _id: 'token',
  }).catch(function(err) {
    if (err.status !== 409) throw err;
  });
  state.set(['app', 'token'], input.token);
  state.set('app.offline', false);
};
//storeToken.outputs = ['success', 'error'];
//storeToken.async = true;

function showDomainModal({state}) {
  state.set(['app', 'view', 'domain_modal', 'visible'], true);
};

function hideDomainModal({state}) {
  state.set(['app', 'view', 'domain_modal', 'visible'], false);
};

function setDomainText({input, state}) {
  state.set(['app', 'view', 'domain_modal', 'text'], input.value)
};
