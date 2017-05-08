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
    current_location: {},
    map_center_location: {},
    rocks: {},
    selected_key: {},
    map_bounds: {},
    comment_input: '',
    sync_failed: {},
    sync_new: {},
  },
  view: {
    rock_pick_state: false,
    current_location_state: false,
    marker_edit_mode: false,
    current_location_toggle: false,
    show_all_rocks: true,
    domain_modal: {
      text: '',
      visible: true,
    },
  }
}; 
// stateTree['oada-cache'] = {}
// stateTree['oada-cache']['bookmarks'] = {}
// stateTree['oada-cache']['bookmarks']['rocks'] = {}
// stateTree['oada-cache']['bookmarks']['rocks']['list-index'] = {}

export default stateTree; 
