import React, { PropTypes } from 'react';
import {connect} from 'cerebral-view-react';
import RockMap from '../Map';
import styles from './app.css'
import MenuBar from '../MenuBar'

export default connect({

}, {
  init: 'app.init',
},

  class App extends React.Component {
 
    componentWillMount() {
      this.props.init({});
    }

    render() {
      return (
        <div className="app">
          <MenuBar />
          <RockMap />
        </div>
      )
    }
  }
)
