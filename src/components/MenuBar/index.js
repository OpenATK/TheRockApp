import React from 'react';
import { connect } from 'cerebral/react';
import styles from './menu-bar.css';
import {state, signal} from 'cerebral/tags';

export default connect({
  showAll: state`app.view.show_all_rocks`,
  centerLocation: state`app.model.map_center_location`,
  rockPickStatus: state`app.view.rock_pick_state`,
  hideRockButtonClicked: signal`app.hideRockButtonClicked`,
  addRockButtonClicked: signal`app.addRockButtonClicked`,
  clearCacheButtonClicked: signal`app.clearCacheButtonClicked`,
  setDomainButtonClicked: signal`app.setDomainButtonClicked`,
  syncButtonClicked: signal`app.syncButtonClicked`,
},

  class MenuBar extends React.Component {

    render() {
      return (
        <div className={styles['menu-bar']}>
          <img 
            src="launcher.png"
            alt="meaningfulText"
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
