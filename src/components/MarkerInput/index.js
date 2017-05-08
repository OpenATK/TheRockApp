import React from 'react';
//import {PropTypes} from 'prop-types';
import { connect } from 'cerebral/react';
import './marker-input.css';
import {state, signal} from 'cerebral/tags';

export default connect({
  rockPickStatus: state`app.view.rock_pick_state`,
  commentInput: state`app.model.comment_input`,
  rockKey: state`app.model.selected_key`,
  pickButtonClicked: signal`app.pickButtonClicked`,
  commentInputTextChanged: signal`app.commentInputTextChanged`,
  addComment: signal`app.addComment`,
  deleteButtonClicked: signal`app.deleteButtonClicked`,
},

  class MarkerInput extends React.Component {

    render() {
      return (
        <div className={'marker-panel'}>
          <button
            className={(!this.props.rockPickStatus) ? 'pick-button' : 'put-button'}
            onClick={() => this.props.pickButtonClicked({})}
          />
          <button
            className={'delete-button'}
            onClick={() => this.props.deleteButtonClicked({id: this.props.rockKey})}
          />
          <br /><br />
          <input
            type="text"
            className={'comment-input'}
            placeholder="Comments..."
            value={this.props.commentInput}
            onChange={(e) => this.props.commentInputTextChanged({value:e.target.value})}
            onKeyDown={(e) => {if (e.keyCode === 13 || e.keyCode === 9) {this.props.addComment({text: this.props.commentInput, id: this.props.rockKey})}}}
          />
        </div>
      );
    }
  }
)
