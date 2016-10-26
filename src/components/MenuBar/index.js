import React, { PropTypes } from 'react';
//import { Decorator as Cerebral, Link } from 'cerebral-view-react';
import { connect } from 'cerebral-view-react';
import uuid from 'uuid';
import styles from './menu-bar.css';

export default connect(props => ({
  hideMode: 'app.view.hide_mode',
}), {
  addRockButtonClicked: 'app.addRockButtonClicked',
  hideRockButtonClicked: 'app.hideRockButtonClicked',
},

  class MenuBar extends React.Component {

    render() {

      return (
        <div className={styles['menu-bar']}>
          <button 
            type="button" 
            className={styles['menu-button']} 
            onClick={() => this.props.hideRockButtonClicked({})}
            >
            {!this.props.hideMode ? 'Hide Picked Rocks' : 'Show All Rocks'}
          </button>

          <button 
            type="button" 
            className={styles['menu-button']} 
            //onClick={() => this.props.addRockButtonClicked({})}
            >
            Current Location
          </button>
          
          <button 
            type="button" 
            className={styles['menu-button']} 
            onClick={() => this.props.addRockButtonClicked({})}
            >
            Add Rock
          </button>
        </div>
      );
    }
  }
)