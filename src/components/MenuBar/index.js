import React from 'react';
import { connect } from '@cerebral/react';
import './menu-bar.css';
import {state, signal} from 'cerebral/tags';

export default connect({
         showAll: state`view.show_all_rocks`,
  centerLocation: state`model.map_center_location`,
  rockPickStatus: state`view.rock_pick_state`,
  hideRockButtonClicked: signal`hideRockButtonClicked`,
   addRockButtonClicked: signal`addRockButtonClicked`,
}, props => 
  <div className={'menu-bar'}>
    <img src="launcher.png"
         alt="meaningfulText"
         className={'menu-appicon'}
    />

    <font className={'menu-title'}>
      RockApp
    </font>

    <button
      className={props.showAll ? 'eye-all-button' : 'eye-unpicked-button'}
      onClick={() => props.hideRockButtonClicked({})}
    />
          
    <button
      className={'add-button'}
      onClick={() => props.addRockButtonClicked({lat: props.centerLocation.lat, lng: props.centerLocation.lng, status: props.rockPickStatus})}
    />

  </div>
);
