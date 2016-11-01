import uuid from 'uuid';

var stateTree = {
  token: {},
  offline: true,

  model: {
    user: {},
    domain: '',
    'data_index': {
    },
    geohashes_to_draw: {},
    geohashes_on_screen: {},
    available_geohashes: {},
    current_location: {},  //keep updating current location
    map_location: {},  //set when a button clicked and center to that location
    map_center_location: {},
    rocks: [],  //new
  },
  view: {
    current_location_toggle: false,
    add_mode: false,  //new
    hide_mode: false,  //new
    domain_modal: {
      text: '',
      visible: true,
    },
  }
}; 

export default stateTree; 
