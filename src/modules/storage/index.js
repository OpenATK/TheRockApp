import StorageModule from '@cerebral/storage'

export default StorageModule({
 
  target: localStorage,
  
  json: true,

  sync: {
    startup_sequence: 'session.startup_sequence'
  }

})
