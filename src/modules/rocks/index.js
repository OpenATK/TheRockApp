import { Module } from 'cerebral';
import * as signals from './chains';

export default Module({
  state: {
    connection_id: '',
		records: {},
	},
  signals,
});
