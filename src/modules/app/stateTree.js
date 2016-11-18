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
    map_center_location: {},
    rocks: {},  //new
    selected_key: {},
    map_bounds: {},
    comment_input: '',
  },
  view: {
    rock_pick_state: false,
    current_location_state: false,
    marker_edit_mode: false,
    current_location_toggle: false,
    show_all_rocks: true,  //new
    domain_modal: {
      text: '',
      visible: true,
    },
  }
}; 

export default stateTree; 
