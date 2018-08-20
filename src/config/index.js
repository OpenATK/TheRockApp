let overrides = require('./config.dev.js').default;

//----------- Define default configs here ----------

export const title = 'RockApp';
export const scope = 'oada.rocks:all';
const defaults = {
	scope,
  title,
};

//--------------------------------------------------
if (process.env.REACT_APP_PROD_DEV) {
  overrides = require('./config.prod-dev.js').default;
} else if (process.env.NODE_ENV === 'production') {
  overrides = require('./config.prod.js').default;
}

let toExport =  {...defaults, ...overrides};

export const oadaDomain = toExport.oadaDomain;
export const websiteDomain = toExport.websiteDomain;
export const redirect = toExport.websiteDomain + '/oauth2/redirect.html';
export const metadata = toExport.metadata;
export const devtoolsPort = toExport.devtoolsPort;
export const defaultNewConnectionURL = toExport.defaultNewConnectionURL;
export const appName = toExport.appName;
export const contentType = toExport.contentType;
export const bookmarksRocks = toExport.bookmarksRocks;

let _operations = {};

export default toExport;
