//This is a dialog that helps the user manage his
//server connections
import React from 'react';

import { connect } from '@cerebral/react';
import { state, signal } from 'cerebral/tags';

import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  paper: {
    color: '#ffffff',
    backgroundColor: '#1c313a',
  },
  title: {
    color: '#ffffff',
    'font-size': '1.1rem',
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

class ManageConnections extends React.Component {

  render() {
    const {classes } = this.props;
    
    //Render differently if we have a connection.
    var list = null;
    if (Object.keys(this.props.connections).length) { 
      list = ( 
      <List>
        <ListItem> 
          <Button
            fullWidth={true}
            onClick={() => this.props.reconnect({})}
            classes={{root: classes.buttons}}
            variant="raised">
            <Typography 
              classes={{root: classes.text}}> 
              Logout & change connection
            </Typography>
          </Button>
        </ListItem>
      </List>
      );
    } else {
      list = (
      <List>
        <ListItem>
          <Button
            fullWidth={true}
            onClick={() => this.props.reconnect({})}
            classes={{root: classes.buttons}}
            variant="raised">
            <Typography 
              classes={{root: classes.text}}> 
              Connect to Server
            </Typography>
          </Button>
        </ListItem>
      </List> 
      );
    }
    

    return (
      <Dialog
        classes={{paper: classes.paper}}
        open={this.props.editing_connection}
        onClose={() => this.props.editingConnection({})}>
        <Typography
          align='center' 
          classes={{root: classes.title}}> 
          Manage Cloud Connection 
        </Typography>
        <div>
          {list}
        </div>
      </Dialog>
    );
  }
}
   
  
export default connect ({
  editing_connection: state`session.editing_connection`,
         connections: state`oada.connections`,  

	editingConnection: signal`session.editingConnection`,
	        reconnect: signal`session.reconnect`,
  },
  withStyles(styles)(ManageConnections)
);

