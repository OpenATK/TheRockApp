import db from '../../Cache';

function putInPouch(app_state_location) {
  function action({state, path}) {
    var val = state.get(app_state_location);
    if (val) {
      return db().put({
        doc: {val},
        _id: app_state_location,
      }).then((result) => {
        return path.success({result})
      }).catch(function(err) {
        if (err.status !== 409) throw err;
        return path.error()
      })
    } else return path.error()
  }

  // You can set custom display names for the debugger
  action.displayName = 'putInPouch'

  return action
}

export default putInPouch