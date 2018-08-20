//This component renders a editing bar at the bottom
//of the app. There, the user edits rocks.
import React from 'react';
import PropTypes from 'prop-types';

import { connect } from '@cerebral/react';
import { state, signal } from 'cerebral/tags';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';

import check from '../../icons/check.png';

const styles = theme => ({
  paper: {
    backgroundColor: '#1c313a',
  },
  label: {
    color: '#ffffff'
  },
  underline: {
    '&:before':{
      "border-bottom-color": '#ffffff',
    },
    '&:after': {
      "border-bottom-color": '#ffffff',
    },
  },
  icons: {
    height: 4*theme.spacing.unit,
    width: 4*theme.spacing.unit,
  },
  buttons: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  root: {
    color: '#ffffff',
    backgroundColor: '#718792',
  },
});

class MarkerInput extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
	};

  render() {
    const {classes } = this.props;

    const currock = (this.props.rocks && this.props.rockKey) ? this.props.rocks[this.props.rockKey] : { comment: '' };

    return (
      <Drawer
        variant="persistent"
        anchor="bottom"
        open={this.props.editMode}
        classes={{paper: classes.paper}}>
        <Toolbar>
          <IconButton
            className={classes.buttons}
            onClick={() => this.props.finishEditing({id: this.props.rockKey})}>
              <img src={check} className={classes.icons} alt=''/>
          </IconButton>
          <FormControl fullWidth>
            <FormHelperText classes={{root: classes.label}}>
              Comment Here
            </FormHelperText>
            <Input
              classes={{
                root: classes.label,
                underline: classes.underline 
              }}
              value={currock.comment}
              onChange={(e) => this.props.trackInputText({value: e.target.value, id: this.props.rockKey }) }
            />
          </FormControl>
          <Button
            variant="raised"
            className={classes.buttons}
            classes={{root: classes.root}}
            onClick={() => this.props.togglePickedStatus({id: this.props.rockKey, picked: !currock.picked})}>
            {currock.picked ? 'Put Down' : 'Pick Up'}
          </Button>
        </Toolbar>
      </Drawer>
    );
  }
}
   
  
export default connect ({
         rockKey: state`session.selected_key`,
           rocks: state`rocks.records`,
        editMode: state`session.marker_edit_mode`,
    commentValue: state`session.comment_input`,

  togglePickedStatus: signal`session.togglePickedStatus`,
      trackInputText: signal`session.trackInputText`,
	     finishEditing: signal`rocks.finishEditing`
  },
  withStyles(styles)(MarkerInput)
);

