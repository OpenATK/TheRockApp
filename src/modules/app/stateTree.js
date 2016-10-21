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
    current_geohashes: {},
    rocks: [],  //new
  },
  view: {
    add_mode: false,  //new
    domain_modal: {
      text: '',
      visible: true,
    },
  }
}; 

export default stateTree; 
