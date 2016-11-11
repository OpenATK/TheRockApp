import React, { Proptypes } from 'react';
import { connect } from 'cerebral-view-react';
import styles from './marker-input.css';
import uuid from 'uuid';
import fastyles from '../css/font-awesome.min.css';
import FontAwesome from 'react-fontawesome';

export default connect(props => ({
  rockPickStatus: 'app.view.rock_pick_state',
}), {
  pickButtonClicked: 'app.pickButtonClicked',
},

  class MarkerInput extends React.Component {

    render() {
      return (
        <div className={styles['marker-panel']}>
          <button
            className={styles[(!this.props.rockPickStatus) ? 'pick-button' : 'put-button']}
            onClick={() => this.props.pickButtonClicked({})}
          />
          <br /><br />
          <input
            type="text"
            className={styles['comment-input']}
            placeholder="Comment"

          />
        </div>
      );
    }
  }
)
