import PouchDB from 'pouchdb';
var singleton = null;

module.exports = () => {
  if (!singleton) singleton = new PouchDB('TheRockApp', { size: 50 });
  return singleton;
}