import React, { PropTypes } from 'react';
//import { Decorator as Cerebral, Link } from 'cerebral-view-react';
import { connect } from 'cerebral-view-react';
import { Icon } from 'leaflet';
import uuid from 'uuid';
import styles from './menu-bar.css';

export default connect(props => ({
  showAll: 'app.view.show_all_rocks',
  centerLocation: 'app.model.map_center_location',
  rockPickStatus: 'app.view.rock_pick_state',
}), {
  hideRockButtonClicked: 'app.hideRockButtonClicked',
  addRockButtonClicked: 'app.addRockButtonClicked',
},

  class MenuBar extends React.Component {

    render() {
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
            src={(this.props.showAll) ? "eye_all_rocks.png" : "eye_unpicked.png"}
            onClick={() => this.props.hideRockButtonClicked({})}
            >            
          </img>
          
          <img 
            className={styles['menu-image']} 
            src="add_button.png"
            onClick={() => this.props.addRockButtonClicked({lat: this.props.centerLocation.lat, lng: this.props.centerLocation.lng, status: this.props.rockPickStatus})}
            >            
          </img>

        </div>
      );
    }
  }
)