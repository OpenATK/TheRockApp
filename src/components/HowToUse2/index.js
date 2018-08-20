//This component is a dialog that explains how to use
//the app
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

import secondPage from '../../icons/secondPage.png';

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

class HowToUse1 extends React.Component {

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
          How to use the app 2/2: 
        </Typography>
        <DialogContent>
          <img src={secondPage} alt=''/>
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
  withStyles(styles)(HowToUse1)
);

