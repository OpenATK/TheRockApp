import React from 'react';
//import {PropTypes} from 'prop-types';
import {connect} from 'cerebral/react';
import RockMap from '../Map';
import styles from './app.css'
import MenuBar from '../MenuBar'
import OadaDomainModal from '../OadaDomainModal'
import {signal} from 'cerebral/tags';

export default connect({
  init: signal`app.init`,
},
  class App extends React.Component {

    componentWillMount() {
      this.props.init({});
    }
  
    render() {
      return (
        <div className={styles['app']}>
          <OadaDomainModal />
          <MenuBar />
          <RockMap />
        </div>
      )
    }
  }
)
