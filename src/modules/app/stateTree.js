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
  },
  view: {
    domain_modal: {
      text: '',
      visible: true,
    },
    legends: {
      elevation: [{
        value: 234,
        color: {
          r: 255,
          g: 0,
          b: 0, 
          a: 255,
        },
      },{
        value: ((243-234)/2)+234,
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 255,
        },
      },{ 
        value: 243,
        color: {
          r: 0,
          g: 255,
          b: 0,
          a: 255,
        },
      }],
    },
  }
}; 

export default stateTree; 
