import React, { PropTypes } from 'react';
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
  clearCacheButtonClicked: 'app.clearCacheButtonClicked',
  setDomainButtonClicked: 'app.setDomainButtonClicked',
  syncButtonClicked: 'app.syncButtonClicked',
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

          <button
            className={styles[(this.props.showAll) ? 'eye-all-button' : 'eye-unpicked-button']}
            onClick={() => this.props.hideRockButtonClicked({})}
            >
          </button>
          
          <button
            className={styles['add-button']}
            onClick={() => this.props.addRockButtonClicked({lat: this.props.centerLocation.lat, lng: this.props.centerLocation.lng, status: this.props.rockPickStatus})}
            >
          </button>

         <button 
           type="button" 
           className={styles['clear-cache-button']}
           onClick={()=>this.props.clearCacheButtonClicked({})}>
           Clear Cache
         </button>
         
         <button 
           type="button" 
           className={styles['change-domain-button']}
           onClick={()=>this.props.setDomainButtonClicked({})}>
           Change Domain
         </button>

         <button 
           type="button" 
           className={styles['sync-button']}
           onClick={()=>this.props.syncButtonClicked({})}>
           Sync
         </button>

        </div>
      );
    }
  }
)