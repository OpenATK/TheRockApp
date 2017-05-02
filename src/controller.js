import { Controller } from 'cerebral';
//import Model from 'cerebral/models/immutable'
//import model from './modules/app/model';
import cache from './modules/cerebral-module-oada-cache'
import app from './modules/app'
import Devtools from 'cerebral/devtools'
//import Router from 'cerebral-router'

const controller = Controller({
//  state: {},
//  signals: {},
  modules: {
		 app,
  },

	devtools: Devtools({ remoteDebugger: 'localhost:8787' }),
	
	// router: Router({
	//  '/': 'app.rootRouted',
	//  '/:filter': 'app.filterClicked'
	// }, {
	//  onlyHash: true
	// }),

  providers: [

  ]

})
export default controller
