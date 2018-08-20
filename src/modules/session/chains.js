import { set, toggle, debounce, increment, when} from 'cerebral/operators';
import { props, state } from 'cerebral/tags';
import { sequence } from 'cerebral';
import * as rocks from '../rocks/chains.js';
import * as app from '../app/chains.js';
import oada from '@oada/cerebral-module/sequences';

//This lets the app know that a marker has been selected for editing
export const startEditing = [
  set(state`session.selected_key`, props`id`),
  set(state`session.marker_edit_mode`, true),
];

//This function toggles a rock's picked status locally. Changes are committed at the end of the edit
export const togglePickedStatus = [
  ({state, props}) => state.set(`rocks.records.${props.id}.picked`, props.picked),
];

//This function toggles between seeing all rocks and seeing unpicked
export const togglePickedHiding = [
  toggle(state`session.show_all_rocks`),
];

//This sets the current user location in the state
export const storeUserLocation = [
  ({state,props}) => state.set('session.current_location', { lat: props.lat, lng: props.lng }),
  set(state`session.current_location_state`, true),
];

//This tells the map to center on the user
export const centerOnUser = [
  set(state`session.target_map_center`, { lat: 43.645224, lng: -115.9932984 }),
  debounce(1),
  {
    continue: [set(state`session.target_map_center`, state`session.current_location`)],
    discard: [],
  },
];

//This tracks the leaflet map center. Tricky, since leaflet maintains it's own state.
export const trackMapPosition = sequence('session.trackMapPosition', [
  setMapCenter,
  set(state`session.map_bounds`, props`bounds`),
]);

//This tracks the comment changes locally. Changes are commited at the end of editing below.
export const trackInputText = [
  set(state`rocks.records.${props`id`}.comment`, props`value`)
];

export const editingConnection = [
  toggle(state`session.editing_connection`),
];

export const reconnect = sequence('session.reconnect', [
  editingConnection,
  ({state, props}) => {
    connection_id: state.get('rocks.connection_id');
  },
  ({state, props}) => {
    state.set('rocks', {
      connection_id: '',
      records: {}  
    });
    state.set('oada', {connections: {}});
  },
  //oada.resetCache,
  app.initialize
]);

export const sequenceIncrement = sequence('session.sequnceIncrement', [
  when(state`session.startup_sequence`, (value) => value < 3),
  {
    true: [increment(state`session.startup_sequence`)],
    false: [set(state`session.startup_sequence`, 0)],
  },
]);

//Used above several times
function setMapCenter({props, state}) {
  state.set('session.live_map_center', { lat: props.lat, lng: props.lng });
};
