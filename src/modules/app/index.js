import { Module } from 'cerebral';
import oadaModule from '@oada/cerebral-module'
import oadaProvider from '@oada/cerebral-provider'
import rocks from './../rocks'
import session from './../session'

import * as signals from './chains';

export default Module({
  modules:{
    rocks,
    oada: oadaModule,
    session,
  },
  signals,
  providers: {
    oada: oadaProvider
  }
});
