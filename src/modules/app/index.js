import { Module } from 'cerebral';
import oadaModule from '@oada/cerebral-module'
import oadaProvider from '@oada/cerebral-provider'
import rocks from './../rocks'
import session from './../session'
import storage from './../storage'

import * as signals from './chains';

export default Module({
  modules:{
    oada: oadaModule,
    rocks,
    session,
    storage,
  },

  signals,

  providers: {
    oada: oadaProvider
  }
});
