//Production Values
const devtoolsPort = 8787;
const oadaDomain = process.env.REACT_APP_OADA_DOMAIN || 'https://localhost';
const websiteDomain = 'https://fieldworkapp.oada-dev.com';
const metadata = require('./prod_metadata.js');
const defaultNewConnectionURL = 'https://fieldworkapp.oada-dev.com';
const appName = "RockApp";
const contentType = 'application/vnd.oada.rock.1+json';
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
