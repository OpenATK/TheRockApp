import React, { Proptypes } from 'react';
import { connect } from 'cerebral-view-react';
import styles from './marker-input.css';
import uuid from 'uuid';
import fastyles from '../css/font-awesome.min.css';
import FontAwesome from 'react-fontawesome';

export default connect(props => ({
  rockPickStatus: 'app.view.rock_pick_state',
  commentInput: 'app.model.comment_input',
  rockKey: 'app.model.selected_key',
}), {
  pickButtonClicked: 'app.pickButtonClicked',
  commentInputTextChanged: 'app.commentInputTextChanged',
  addComment: 'app.addComment',
  deleteButtonClicked: 'app.deleteButtonClicked',
},

  class MarkerInput extends React.Component {

    render() {
      return (
        <div className={styles['marker-panel']}>
          <button
            className={styles[(!this.props.rockPickStatus) ? 'pick-button' : 'put-button']}
            onClick={() => this.props.pickButtonClicked({})}
          />
          <button
            className={styles['delete-button']}
            onClick={() => this.props.deleteButtonClicked({id: this.props.rockKey})}
          />
          <br /><br />
          <input
            type="text"
            className={styles['comment-input']}
            placeholder="Comments..."
            value={this.props.commentInput}
            onChange={(e) => this.props.commentInputTextChanged({value:e.target.value})}
            onKeyDown={(e) => {if (e.keyCode == 13 || e.keyCode == 9) {this.props.addComment({text: this.props.commentInput, id: this.props.rockKey})}}}
          />
        </div>
      );
    }
  }
)
