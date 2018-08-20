//Local Development Values
const devtoolsPort = 8787;
const oadaDomain = process.env.REACT_APP_OADA_DOMAIN || 'https://localhost';
const websiteDomain = 'http://localhost:' + parseInt(window.location.port, 10);
const metadata = require('./dev_metadata.js');
const defaultNewConnectionURL = 'https://localhost';
const appName = "RockApp";
const contentType = 'application/vnd.oada.rocks.1+json';
const bookmarksRocks = '/bookmarks/rocks';

export default {
  oadaDomain,
  devtoolsPort,
  websiteDomain,
  metadata,
  defaultNewConnectionURL,
  appName,
  contentType,
  bookmarksRocks
}
