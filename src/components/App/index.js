//This is the root component (more or less). A bit of 
//page layout is handle, but it mostly just calls
//children components
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';

import MenuBar from '../MenuBar/';
import MapContainer from '../Map/';
import MarkerInput from '../MarkerInput/';
import ManageConnections from '../ManageConnections/';
import OadaInstructions from '../OadaInstructions/';
import HowToUse1 from '../HowToUse1/';
import HowToUse2 from '../HowToUse2/';

const styles = theme => ({
  app: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    'flex-direction': 'column',
  },
  mapPanel: {
    display: 'flex',
    'flex-direction': 'column',
    width: '100%',
    height: '100%',
  },
});

class App extends React.Component {

  componentWillMount() {
   this.props.initialize({});
  }

  render() {
    const { classes } = this.props;

    return (   
      <div className={classes.app}>
        <MenuBar/>
        <div className={classes.mapPanel}>
          <MapContainer/>
          <MarkerInput/>
          <ManageConnections/>
          <OadaInstructions/>
          <HowToUse1/>
          <HowToUse2/>
        </div>
      </div>
    );
  }
}

export default connect(
  {
    initialize: signal`initialize`,
  },
  withStyles(styles, { withTheme: true })(App)
);
  

