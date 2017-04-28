import { set } from 'cerebral/operators';
var pointer = require('json-pointer');
import { props, state } from 'cerebral/tags'

function setRockToState(app_state_location) {
  function action({props, state, path}) {
    var customStatePath = app_state_location;
    if (customStatePath) {
      var removeDots = customStatePath.replace(/\./g, '/');
      var addSlash = '/' + removeDots;
      //console.log(addSlash)
      //console.log('statePath entered by developer')
      //var stateRockPath = statePath + '.' + props.id;
      var pathTemp = pointer.parse(addSlash);
      var stateRockPath = pathTemp.concat(props.id);
      //console.log(stateRockPath)
    } else {
      //console.log('default statePath')
      var stateRockPath = props.defaultStatePath;
    }
    //set(state`stateRockPath`, props`content`);
    state.set(stateRockPath, props.content);
  }

  // You can set custom display names for the debugger
  action.displayName = 'setRockToState'

  return action
}

export default setRockToState