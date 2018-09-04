//This is a dialog that explains rock storage on the server
import React from 'react';

import { connect } from '@cerebral/react';
import { state, signal } from 'cerebral/tags';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  paper: {
    color: '#ffffff',
    backgroundColor: '#1c313a',
  },
  title: {
    color: '#ffffff',
    'font-size': '1.2rem',
    'font-weight': '500',
    margin: 0,
    padding: '24px 24px 20px',
    flex: '0 0 auto',
  },
  text: {
    color: '#ffffff',
  },
  buttons: {
    backgroundColor: '#718792',
  },
};

class OadaInstructions extends React.Component {

  render() {
    const {classes } = this.props;


    return (
      <Dialog
        classes={{paper: classes.paper}}
        open={this.props.startupSequence === 3}
        onClose={() => this.props.sequenceIncrement({})}>
        <Typography
          align='center' 
          classes={{root: classes.title}}> 
          How to get your rocks in the cloud: 
        </Typography>
        <DialogContent>
          <DialogContentText 
            paragraph={true} 
            classes={{root: classes.text}}>
              To allow you to connect to the database and store the rocks you create, a login popup will be launched, pre-populated with default public account credentials. Feel free to use this account to play around, but know that any user in this public account can modify rocks you enter there. To log in to your private account (if you have one set up) after startup, click the cloud icon, which will launch the popup again.
          </DialogContentText>
          <DialogContentText 
            paragraph={true} 
            classes={{root: classes.text}}>
            To see this instruction series again, click the RockApp Icon in the top-left corner.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <DialogContentText 
            align='left'
            classes={{root: classes.text}}>
              3/3
          </DialogContentText>
          <Button
            onClick={() => this.props.sequenceIncrement({})}
            classes={{root: classes.buttons}}
            variant="raised">
            <Typography 
              classes={{root: classes.text}}> 
              Next 
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
   
  
export default connect ({
  startupSequence: state`session.startup_sequence`, 

  sequenceIncrement: signal`session.sequenceIncrement`,  
  },
  withStyles(styles)(OadaInstructions)
);

