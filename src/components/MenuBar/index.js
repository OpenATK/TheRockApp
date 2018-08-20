//This component is an Appbar at the top of the page. 
import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import CloudTwoToneIcon from '@material-ui/icons/CloudTwoTone';
import CloudOffTwoToneIcon from '@material-ui/icons/CloudOffTwoTone';

import { connect } from '@cerebral/react';
import { state, signal } from 'cerebral/tags';

import launcherIcon from './../../icons/launcher.png';
import addRock from './../../icons/add.png';
import findLocation from './../../icons/gps_found.ico';
import seeAll from './../../icons/eye_all_rocks.png';
import seeUnpicked from './../../icons/eye_unpicked.png';
import deleteIcon from './../../icons/delete.png';

const styles = theme => ({
  root: {
    backgroundColor: '#1c313a',
  },
  flex: {
    flex: 1,
  },
  appIcon: {
    [theme.breakpoints.up('xs')]: {
      marginLeft: -1.5*theme.spacing.unit,
      marginRight: 1.5*theme.spacing.unit,
      width: 6*theme.spacing.unit,
      height: 6*theme.spacing.unit,
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: -1*theme.spacing.unit,
      marginRight: 1*theme.spacing.unit,
      width: 5*theme.spacing.unit,
      height: 5*theme.spacing.unit,
    },
  },
  icon: {
    [theme.breakpoints.up('xs')]: {
      width: 5*theme.spacing.unit,
      height: 5*theme.spacing.unit,
    },
    [theme.breakpoints.down('xs')]: {
      width: 4*theme.spacing.unit,
      height: 4*theme.spacing.unit,
    },
  },
  cloudIcon: {
    color: '#FFFFFF',
    [theme.breakpoints.up('xs')]: {
      width: 5*theme.spacing.unit,
      height: 5*theme.spacing.unit,
    },
    [theme.breakpoints.down('xs')]: {
      width: 4*theme.spacing.unit,
      height: 4*theme.spacing.unit,
    },
  },
  button: {
    [theme.breakpoints.up('xs')]: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0*theme.spacing.unit,
      marginRight: 0*theme.spacing.unit,
    }, 
  },
});

class MenuBar extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  render() {
    const { classes } =  this.props;

    var oadaIcon;
    if (Object.keys(this.props.connections).length) {
      oadaIcon = <CloudTwoToneIcon className={classes.cloudIcon}/>
    } else {
      oadaIcon = <CloudOffTwoToneIcon className={classes.cloudIcon}/>
    }
    
    var locateIcon;
    if (this.props.currentLocationState) {
      locateIcon = 
        <IconButton
          className={classes.button}
          onClick = {() => this.props.centerOnUser({})}>
          <img src={findLocation} className={classes.icon} alt=''/>
        </IconButton>
    } else {
      locateIcon = null;
    }    

    const normal = (
    <div>
      <IconButton
        className={classes.button}
        onClick={() => this.props.createNewRock({lat: this.props.centerLocation.lat, lng: this.props.centerLocation.lng})}>
        <img src={addRock} className={classes.icon} alt=''/>
      </IconButton>
      {locateIcon}
      <IconButton
        className={classes.button}
        onClick = {() => this.props.togglePickedHiding({})}>
        <img src={this.props.showAll ? seeUnpicked : seeAll} className={classes.icon} alt=''/>
      </IconButton>
      <IconButton
        className={classes.button}
        onClick = {() => this.props.editingConnection({})}>
        {oadaIcon}
      </IconButton>
    </div> 
    );

    const editing = (
      <IconButton
        className={classes.button}
        onClick = {() => this.props.deleteRock({id: this.props.rockKey})}>
        <img src={deleteIcon} className={classes.icon} alt=''/>
      </IconButton>
    );

    let icons = null;
    if (this.props.editMode) {
      icons = editing
    } else {
      icons = normal
    }

    return (
      <AppBar position='static' classes={{root: classes.root}}>
        <Toolbar>
          <IconButton
            onClick = {() => this.props.sequenceIncrement({})}>
            <img src={launcherIcon} className={classes.appIcon} alt=''/>
          </IconButton>
          <Typography variant='title' color='inherit' className={classes.flex}>
            RockApp
          </Typography>
          {icons}
        </Toolbar>
      </AppBar>
    );
  }
}

export default connect({
               showAll: state`session.show_all_rocks`,
              editMode: state`session.marker_edit_mode`,
        centerLocation: state`session.live_map_center`,
               rockKey: state`session.selected_key`,
           connections: state`oada.connections`,
  currentLocationState: state`session.current_location_state`,

        centerOnUser: signal`session.centerOnUser`,
  togglePickedHiding: signal`session.togglePickedHiding`,
          deleteRock: signal`rocks.deleteRock`,
       createNewRock: signal`rocks.createNewRock`,
   editingConnection: signal`session.editingConnection`,
   sequenceIncrement: signal`session.sequenceIncrement`
  }, 
  withStyles(styles)(MenuBar)
);
