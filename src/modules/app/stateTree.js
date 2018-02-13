var stateTree = {
  model: {
    user: {},
    domain: '',
    'data_index': {
    },
    current_location: { lat: '40.1234', lng: '-86.3423' },
    map_center_location: {},
    rocks: {}, // { picked: true|false, location: { lat: '40.123', lng: '-86.123' }, comments: '' }
    selected_key: '',
    map_bounds: {},
    comment_input: '',
  },
  view: {
    rock_pick_state: false,
    current_location_state: false,
    marker_edit_mode: false,
    current_location_toggle: false,
    show_all_rocks: true,
  }
}; 

export default stateTree; 
