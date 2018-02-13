import _ from 'lodash';
import uuid from 'uuid';
import { set, toggle } from 'cerebral/operators';
import { props, state } from 'cerebral/tags'

export const showEdit = [
  set(state`model.selected_key`, props`id`),
  set(state`view.marker_edit_mode`, true),
];

export const addRockLoc = [
  ({state,props}) => {
    const id = uuid.v4();
    state.set(`model.rocks.${id}`, {
      picked: false,
      comment: '',
      location: { lat: props.lat, lng: props.lng },
    });
    return { id }; // this needs to be in props for showEdit
  },
  ...showEdit,
];

export const setNewRockLoc = [ 
  ({state,props}) => state.set(`model.rocks.${props.id}.location`, { lat: props.lat, lng: props.lng }),
];

export const setRockPicked = [
  ({state,props}) => state.set(`model.rocks.${props.id}.picked`, props.picked),
  set(state`view.rock_pick_state`, props`picked`),
];

export const hidePickedMarker = [
  toggle(state`view.show_all_rocks`),
];

export const getCurrentLocation = [
  ({state,props}) => state.set('model.current_location', { lat: props.lat, lng: props.lng }),
  set(state`view.current_location_state`, true),
];

export const showCurrentLocation = [
  set(state`model.map_center_location`, state`model.current_location`),
  set(state`view.current_location_toggle`, true),
];

export const getMapCenter = [
  setMapCenter,
  set(state`model.map_bounds`, props`bounds`),
  set(state`view.marker_edit_mode`, false),
];

export const initSetMapCenter = [
  setMapCenter,
];

export const setBounds = [
  set(state`model.map_bounds`, props`bounds`),
];

export const inputTextChanged = [
  set(state`model.comment_input`, props`value`),
];

export const addCommentText = [
  ({state,props}) => state.set(state`model.rocks.${props.id}.comments`, props.text),
];

export const deleteRock = [
  set(state`view.marker_edit_mode`, false),
  ({state,props}) => state.unset(`model.rocks.${props.id}`),
];

function setMapCenter({props, state}) {
  state.set('model.map_center_location', { lat: props.lat, lng: props.lng });
};

function setPicked({state, path}) {
  const selectedRock = state.get('model.selected_key');
  const picked = state.get('model.rocks'+selectedRock+'.picked');
  state.set('model.rocks'+selectedRock+'.picked', !picked);
  state.set('view.rock_pick_state', !picked);
  return {id: selectedRock}
};


