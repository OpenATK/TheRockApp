import React, { PropTypes } from 'react';
//import { Decorator as Cerebral, Link } from 'cerebral-view-react';
import { connect } from 'cerebral-view-react';
import { Icon } from 'leaflet';
import uuid from 'uuid';
import styles from './menu-bar.css';

export default connect(props => ({
  hideMode: 'app.view.hide_mode',
}), {
  addRockButtonClicked: 'app.addRockButtonClicked',
  hideRockButtonClicked: 'app.hideRockButtonClicked',
  currentLocationButtonClicked: 'app.currentLocationButtonClicked',
},

  class MenuBar extends React.Component {

/*
          <button 
            type="button" 
            className={styles['menu-add-button']} 
            onClick={() => this.props.addRockButtonClicked({})}
            >
            Add Rock
          </button>

          <button 
            type="button" 
            className={styles['menu-button']} 
            onClick={() => this.props.currentLocationButtonClicked({})}
            >
            Current Location
          </button>

          <button 
            type="button" 
            className={styles['menu-button']} 
            onClick={() => this.props.hideRockButtonClicked({})}
            >
            {!this.props.hideMode ? 'Hide Picked Rocks' : 'Show All Rocks'}
          </button>
*/

    render() {
      /*
      var addIcon = L.icon({
        iconUrl: 'add_button.png',
        //iconAnchor: [12.5, 50],
        //iconSize: [50, 50], // size of the icon
      });
      */
      return (
        <div className={styles['menu-bar']}>
          <img 
            src="launcher.png"
            className={styles['menu-appicon']}
            >
          </img>

          <font 
            className={styles['menu-title']}
            >
            RockApp
          </font>

          <img 
            className={styles['menu-image']} 
            src={(!this.props.hideMode) ? "eye_all_rocks.png" : "eye_unpicked.png"}
            onClick={() => this.props.hideRockButtonClicked({})}
            >            
          </img>

          <img 
            className={styles['menu-image']} 
            src="current_location.png"
            onClick={() => this.props.currentLocationButtonClicked({})}
            >            
          </img>
          
          <img 
            className={styles['menu-image']} 
            src="add_button.png"
            onClick={() => this.props.addRockButtonClicked({})}
            >            
          </img>

        </div>
      );
    }
  }
)