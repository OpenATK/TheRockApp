//Production Development Values
const devtoolsPort = 8787;
const oadaDomain = process.env.REACT_APP_OADA_DOMAIN || 'https://localhost';
const websiteDomain = 'https://fieldworkapp.oada-dev.com:8080';
const metadata = require('./proddev_metadata');
const defaultNewConnectionURL = 'https://fieldworkapp.oada-dev.com';

export default {
  oadaDomain,
  devtoolsPort,
  websiteDomain,
  metadata,
  defaultNewConnectionURL
}
