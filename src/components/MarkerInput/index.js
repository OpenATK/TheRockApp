import React from 'react';
import { connect } from '@cerebral/react';
import {state, signal} from 'cerebral/tags';

import './marker-input.css';

export default connect({
  rockPickStatus: state`view.rock_pick_state`,
         rockKey: state`model.selected_key`,
           rocks: state`model.rocks`,
        editMode: state`view.marker_edit_mode`,

        pickButtonClicked: signal`pickButtonClicked`,
  commentInputTextChanged: signal`commentInputTextChanged`,
               addComment: signal`addComment`,
      deleteButtonClicked: signal`deleteButtonClicked`,
}, props => {
console.log('editMode = ', props.editMode); 
  const currock = (props.rocks && props.rockKey) ? props.rocks[props.rockKey] : { comments: '' };
  
  if (!props.editMode) return '';
console.log('drawing edit panel...');
  return (
    <div className={'marker-panel'}>
      <button
        className={(!props.rockPickStatus) ? 'pick-button' : 'put-button'}
        onClick={() => props.pickButtonClicked({ id: props.rockKey, picked: !props.rockPickStatus })}
      />
      <button
        className={'delete-button'}
        onClick={() => props.deleteButtonClicked({id: props.rockKey})}
      />
      <br /><br />
      <input
        type="text"
        className={'comment-input'}
        placeholder="Comments..."
        value={currock.comments}
        onChange={(e) => props.commentInputTextChanged({value:e.target.value})}
        onKeyDown={(e) => {if (e.keyCode === 13 || e.keyCode === 9) {props.addComment({text: props.commentInput, id: props.rockKey})}}}
      />
    </div>
  );
});

