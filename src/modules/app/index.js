import { Module } from 'cerebral';
import stateTree from './stateTree.js';

import { addRockLoc } from './chains';
import { setNewRockLoc } from './chains';
import { setRockPicked } from './chains';
import { hidePickedMarker } from './chains';
import { getCurrentLocation } from './chains';
import { showCurrentLocation } from './chains';
import { getMapCenter } from './chains';
import { showEdit } from './chains';
import { setBounds } from './chains';
import { inputTextChanged } from './chains';
import { addCommentText } from './chains';
import { deleteRock } from './chains';
import { displayDomainModal } from './chains';
import { initSetMapCenter } from './chains';

export default Module(m => {
  return {
    state: stateTree,

    signals: {
      addRockButtonClicked: addRockLoc,
      markerDragged: setNewRockLoc,
      pickButtonClicked: setRockPicked,
      hideRockButtonClicked: hidePickedMarker,
      handleLocationFound: getCurrentLocation,
      currentLocationButtonClicked: showCurrentLocation,
      mapDragged: getMapCenter,
      initSetCenter: initSetMapCenter,
      rockClicked: showEdit,
      boundsFound: setBounds,
      commentInputTextChanged: inputTextChanged,
      addComment: addCommentText,
      deleteButtonClicked: deleteRock,
    }
  };
});
