import { Module } from 'cerebral';
import * as signals from './chains';

export default Module({
  state: {
  	current_location: { lat: 40.428641, lng: -86.913783 },
    live_map_center: { lat: 40.428641, lng: -86.913783 },
    target_map_center: { lat: 40.428641, lng: -86.913783 },
    map_bounds: {},
    current_location_state: false,
    marker_edit_mode: false,
    current_location_toggle: false,
    show_all_rocks: true,
    selected_key: '',
    comment_input: '',
    editing_connection: false,
    startup_sequence: 1,
	},
  signals,
});
