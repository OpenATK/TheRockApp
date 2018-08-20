import { Controller } from 'cerebral';
import app from './modules/app';
import Devtools from 'cerebral/devtools';

export default Controller(app, {
	devtools: process.env.NODE_ENV === 'production' ? null : Devtools({ host: 'localhost:8787' }),
});
