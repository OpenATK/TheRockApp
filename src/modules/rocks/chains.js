import oada from '@oada/cerebral-module/sequences';
import { sequence } from 'cerebral';
import { set } from 'cerebral/operators';
import { props, state } from 'cerebral/tags';
import Promise from 'bluebird';
import uuid from 'uuid';

/////////////////////////////////////////////////////////////////////////////////
//Define our data structure
let tree = {
  'bookmarks': {
   	'_type': 'application/vnd.oada.bookmarks.1+json',
   	'_rev': '0-0',
 	  'rocks':{
   	  '_type': 'application/vnd.oada.rocks.1+json',
   	  '_rev': '0-0',
   	  '*': {
     	  '_type': 'application/vnd.oada.rock.1+json',
     	  '_rev': '0-0' 
   	  }
    }
	}
};

let _localPath = '/bookmarks/rocks';

//This takes data from OADA state and maps it to session state
export const mapOadaToRecords = sequence('rocks.mapOadaToRecords', [
  ({state, props}) => {
    state.set('rocks.records', {});
    let id = state.get('rocks.connection_id')
    let rocks = state.get(`oada.${id}.bookmarks.rocks`);
    return Promise.map(Object.keys(rocks || {}), (key) => {
      //ignore reserved keys used by oada
      if (key.charAt(0) !== '_') state.set(`rocks.records.${key}`, rocks[key])
      return
    }).then(() => {return})
  }
]);

//Define our fetch function
export const fetch = sequence('fetch', [
  ({state, props}) => ({
    requests: [{
      path: _localPath,
      //watch: {signals: ['rocks.mapOadaToRecords']},
    }]
  }),
  ({state, props}) => ({
    tree: tree,
  }),
  oada.get,
  mapOadaToRecords
]);
 
//When a new rock is added, this function creates the rock instance
export const createNewRock = sequence('rocks.addRockLoc', [
  ({state, props}) => {
    var rockId = uuid.v4();
    var rock = {
      "picked": false, 
      "comment":'',
      "location": {
        "lat": props.lat,
        "lng": props.lng
      }    
    };
    return {id: rockId, rock}
  },
  ({state, props}) => ({
	  requests: [{
      data: props.rock,
      type: 'application/vnd.oada.rock.1+json',
      path:  _localPath+ '/' + props.id,
    }]
  }),
  ({state, props}) => ({
    tree: tree,
    connection_id: state.get('rocks.connection_id'),
  }), 
  oada.put,
  mapOadaToRecords
]);

//When a rock is moved, this updates the location
export const resetRockLocation = sequence('rocks.setNewRockLoc', [
  buildUpdateRequest,
  oada.put,
  mapOadaToRecords,
]);

//When the user finishes editing, this sets everything back to normal and commits the comment
export const finishEditing = sequence('rocks.finishEditing', [
  buildUpdateRequest,
  set(state`session.marker_edit_mode`, false),
  set(state`session.selected_key`, ''),
  oada.put,
  mapOadaToRecords,
]);

//Yup, it just deletes rock instances.
export const deleteRock = sequence('rocks.deleteRock', [
  ({state, props}) => ({
    requests: [{
      path: _localPath + '/' +props.id,
      tree
    }]
  }),
  ({state, props}) => ({
    connection_id: state.get('rocks.connection_id'),
    tree
  }),
  set(state`session.marker_edit_mode`, false),
  set(state`session.selected_key`, ''),
  oada.delete,
  //fetch,
  mapOadaToRecords,
]);

//When the app boots up, we'll load all the rock data in our database
export const init = sequence('rocks.init', [
  oada.connect,
  set(state`rocks.connection_id`, props`connection_id`),
  fetch,
]);

//This is used to create requests to modify rocks
function buildUpdateRequest({props, state}) {
  let request = {
    data: {    
      "picked": state.get(`rocks.records.${props.id}.picked`), 
      "comment": state.get(`rocks.records.${props.id}.comment`),
      "location": {
        "lat": props.lat || state.get(`rocks.records.${props.id}.location.lat`),
        "lng": props.lng || state.get(`rocks.records.${props.id}.location.lng`),
      }
    }, 
    type: 'application/vnd.oada.rocks.1+json',
    path: _localPath+ '/'+ props.id,
  };
  let requests = [];
  requests.push(request);
  return {
    requests: requests,
    connection_id: state.get('rocks.connection_id'),
    tree
  }; 
}


