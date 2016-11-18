import uuid from 'uuid';
import request from 'superagent';
import _ from 'lodash';
import geolib from 'geolib';
import md5 from 'md5';
import oadaIdClient from 'oada-id-client';
import { Promise } from 'bluebird';  
var agent = require('superagent-promise')(require('superagent'), Promise);
import PouchDB from 'pouchdb';
import cache from '../../components/RasterLayer/cache.js';
import { LatLngBounds } from 'react-leaflet';

var drawFirstGeohashes = [
  getToken, {
    success: [storeToken, getAvailableData, {
      success: [setAvailableData],
      error: [],
    }], 
    error: [],
  },
];

export var initialize = [
  getOadaDomain, {
    cached: [setOadaDomain, hideDomainModal, drawFirstGeohashes],
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
  setOadaDomain, hideDomainModal, drawFirstGeohashes,
];

export var cancelDomainModal = [
  setOadaDomain, hideDomainModal,
];

export var displayDomainModal = [
  showDomainModal,
];

export var updateDomainText = [
  setDomainText,
];

export var addRockLoc = [
  pushNewRock,
];

export var setNewRockLoc = [
  setRockLoc,
];

export var setRockPicked = [
  setPicked,
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
];

export var deleteRock = [
  removeRock,
];

function removeRock({input, state}) {
  state.unset(['app', 'model', 'rocks', input.id]);
};

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
//  state.set(['app', 'model', 'map_bounds', 0], input.southwest);
//  state.set(['app', 'model', 'map_bounds', 1], input.northeast);
};

function showEditPanel({input, state}) {
  state.set(['app', 'view', 'marker_edit_mode'], true);
  state.set(['app', 'model', 'selected_key'], input.id);
};

function hideEditPanel({state}) {
  state.set(['app', 'view', 'marker_edit_mode'], false);
};

function setMapCenter({input, state}) {
  //console.log(input);
  var obj = {
    lat: input.lat,
    lng: input.lng,
  }
  state.set(['app', 'model', 'map_center_location'], obj);
  //if (state.get(['app', 'view', 'current_location_toggle']) == true) {
  //  state.set(['app', 'view', 'current_location_toggle'], false);
  //}
};

function setMapLocation({state}) {
  var currentLat = state.get(['app', 'model', 'current_location', 'lat']);
  var currentLng = state.get(['app', 'model', 'current_location', 'lng']);
  var obj = {
    lat: currentLat,
    lng: currentLng,
  }
  //state.set(['app', 'model', 'map_location'], obj);
  //state.set(['app', 'view', 'current_location_toggle'], true);
  if (currentLat) {
    state.set(['app', 'model', 'map_center_location'], obj);
    state.set(['app', 'view', 'current_location_toggle'], true);
  }
};

function setCurrentLocation({input, state}) {
  //console.log(input);
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

function setPicked({state}) {
  //console.log(input);
  var selectedRock = state.get(['app', 'model', 'selected_key']);
  var picked = state.get(['app', 'model', 'rocks', selectedRock, 'picked']);
  if (!picked) {
    state.set(['app', 'model', 'rocks', selectedRock, 'picked'], true);
    state.set(['app', 'view', 'rock_pick_state'], true);
  } else {
    state.set(['app', 'model', 'rocks', selectedRock, 'picked'], false);
    state.set(['app', 'view', 'rock_pick_state'], false);
  };
};

function setRockLoc({input, state}) {
  //console.log(input);
  var location = {
    lat: input.lat,
    lng: input.lng,
  };
  state.set(['app', 'model', 'rocks', input.id, 'location'], location);
};

function pushNewRock({input, state}) {
  var id = uuid.v4();
  //console.log(input);
  var currentLocState = state.get(['app', 'view', 'current_location_state']);
  
  if (currentLocState == false) {
    var obj = {
      id: id,
    	location: {
         lat: input.lat,
         lng: input.lng,
       },
       picked: false,
       comments: '',
    };
  }

  if (currentLocState == true) {
    //var southwest = state.get(['app', 'model', 'map_bounds', 0]);
    //var northeast = state.get(['app', 'model', 'map_bounds', 1]);
    //var mapBounds = (southwest, northeast);
    var mapBounds = state.get(['app', 'model', 'map_bounds']);

    var currentLat = state.get(['app', 'model', 'current_location', 'lat']); 
    var currentLng = state.get(['app', 'model', 'current_location', 'lng']);
    
    //console.log(mapBounds.contains(currentLat, currentLng));

    var obj = {
      id: id,
      location: {
         lat: currentLat,
         lng: currentLng,
       },
       picked: false,
       comments: '',
    };
    //console.log(mapBounds);
    var bounds = L.latLngBounds(mapBounds._southWest, mapBounds._northEast);
    var currentLocation = L.latLng(obj.location.lat, obj.location.lng);
    console.log(bounds.contains(currentLocation));
    if (bounds.contains(currentLocation)) {

    } else {
    	state.set(['app', 'model', 'map_center_location', 'lat'], obj.location.lat);
    	state.set(['app', 'model', 'map_center_location', 'lng'], obj.location.lng);
    	state.set(['app', 'view', 'current_location_toggle'], true);
    }

  }
  state.set(['app', 'model', 'rocks', id], obj);
};

function getAvailableData({state, output}) {
  var token = state.get(['app', 'token']);
  var domain = state.get(['app', 'model', 'domain']);
  var url = 'https://' + domain + '/bookmarks/elevation/tiled-maps/geohash-elevation-model/geohash-length-index/';
  var data = {};
  cache.get(url, token).then(function(geohashLengthIndex) {
    return Promise.each(Object.keys(geohashLengthIndex), function(ghLength) {
      return cache.get(url + ghLength + '/geohash-index', token).then(function(ghIndex) {
        return Promise.each(Object.keys(ghIndex), function(bucket) {
          return cache.get(url + ghLength + '/geohash-index/' + bucket + '/geohash-data', token).then(function(geohashData) {
            return Promise.each(Object.keys(geohashData), function(geohash) {
              return data[geohash] = geohash;
            })
          })
        })
      })
    })
  }).then(function() {
    output.success({data});
  })
};
getAvailableData.outputs = ['success', 'error'];
getAvailableData.async = true;

function setAvailableData({input, state}) {
  state.set(['app', 'model', 'data_index'], {elevation: input.data});
};

function getOadaDomain({state, output}) {
  //First, check if the domain is already in the cache;
  var db = new PouchDB('Waterplane');
  db.get('domain').then(function(result) {
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
  var db = new PouchDB('Waterplane');
  db.put({
    doc: {domain: input.value},
    _id: 'domain',
  }).catch(function(err) {
    if (err.status !== 409) throw err;
  })
};

function destroyCache() {
  var db = new PouchDB('Waterplane');
  db.destroy();
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
  var db = new PouchDB('Waterplane');
  db.get('token').then(function(result) {
    output.success({token:result.doc.token});
  }).catch(function(err) { //not in Pouch, prompt for user sign in
    if (err.status !== 404) console.log(err);
    var options = {
      metadata: 'eyJqa3UiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbS9jZXJ0cyIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vdHJpYWxzdHJhY2tlci5vYWRhLWRldi5jb20vb2F1dGgyL3JlZGlyZWN0Lmh0bWwiLCJodHRwOi8vbG9jYWxob3N0OjgwMDAvb2F1dGgyL3JlZGlyZWN0Lmh0bWwiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCJdLCJyZXNwb25zZV90eXBlcyI6WyJ0b2tlbiIsImlkX3Rva2VuIiwiaWRfdG9rZW4gdG9rZW4iXSwiY2xpZW50X25hbWUiOiJUcmlhbHMgVHJhY2tlciIsImNsaWVudF91cmkiOiJodHRwczovL2dpdGh1Yi5jb20vT3BlbkFUSy9UcmlhbHNUcmFja2VyIiwiY29udGFjdHMiOlsiU2FtIE5vZWwgPHNhbm9lbEBwdXJkdWUuZWR1PiJdLCJzb2Z0d2FyZV9pZCI6IjVjYzY1YjIwLTUzYzAtNDJmMS05NjRlLWEyNTgxODA5MzM0NCIsInJlZ2lzdHJhdGlvbl9wcm92aWRlciI6Imh0dHBzOi8vaWRlbnRpdHkub2FkYS1kZXYuY29tIiwiaWF0IjoxNDc1NjA5NTkwfQ.Qsve_NiyQHGf_PclMArHEnBuVyCWvH9X7awLkO1rT-4Sfdoq0zV_ZhYlvI4QAyYSWF_dqMyiYYokeZoQ0sJGK7ZneFwRFXrVFCoRjwXLgHKaJ0QfV9Viaz3cVo3I4xyzbY4SjKizuI3cwfqFylwqfVrffHjuKR4zEmW6bNT5irI',
      scope: 'elevation-data',
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
  var db = new PouchDB('Waterplane');
  db.put({
    doc: {token: input.token},
    _id: 'token',
  }).catch(function(err) {
    if (err.status !== 409) throw err;
  });
  state.set(['app', 'token'], input.token);
  state.set('app.offline', false);
};

function showDomainModal({state}) {
  state.set(['app', 'view', 'domain_modal', 'visible'], true);
};

function hideDomainModal({state}) {
  state.set(['app', 'view', 'domain_modal', 'visible'], false);
};

function setDomainText({input, state}) {
  state.set(['app', 'view', 'domain_modal', 'text'], input.value)
};
