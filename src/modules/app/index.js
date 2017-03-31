import stateTree from './stateTree.js';

import { initialize } from './chains';
import { addGeohashes } from './chains';
import { removeGeohashes } from './chains';
import { clearCache } from './chains';
import { updateDomainText } from './chains';
import { submitDomainModal } from './chains';
import { cancelDomainModal } from './chains';
import { addRockLoc } from './chains';
import { setNewRockLoc } from './chains';
import { setRockPicked } from './chains';
import { hidePickedMarker } from './chains';
import { getCurrentLocation } from './chains';
import { showCurrentLocation } from './chains';
import { getMapCenter } from './chains';
import { showEdit } from './chains';
import { hideEdit } from './chains';
import { setBounds } from './chains';
import { inputTextChanged } from './chains';
import { addCommentText } from './chains';
import { deleteRock } from './chains';
import { displayDomainModal } from './chains';
import { updateRockData } from './chains';

export default (module) => {
  module.addState(
    stateTree
  )

  module.addSignals({

    init: [
      ...initialize
    ],

    clearCacheButtonClicked: [
      ...clearCache,
    ],

   tileUnloaded: [
     ...removeGeohashes,
   ],

    newTileDrawn: [
      ...addGeohashes,
    ],

    domainSubmitClicked: [
      ...submitDomainModal,
    ],

    domainCancelClicked: [
      ...cancelDomainModal,
    ],

    domainTextChanged: {
      chain: [...updateDomainText],
      immediate: true,
    },

    addRockButtonClicked: [
      ...addRockLoc,
    ],

    markerDragged: [
      ...setNewRockLoc,
    ],

    pickButtonClicked: [
      ...setRockPicked,
    ],

    hideRockButtonClicked: [
      ...hidePickedMarker,
    ],

    handleLocationFound: [
      ...getCurrentLocation,
    ],

    currentLocationButtonClicked: [
      ...showCurrentLocation,
    ],

    mapDragged: [
      ...getMapCenter,
    ],

    rockClicked: [
      ...showEdit,
    ],

    boundsFound: [
      ...setBounds,
    ],

    commentInputTextChanged: [
      ...inputTextChanged,
    ],

    addComment: [
      ...addCommentText,
    ],

    deleteButtonClicked: [
      ...deleteRock,
    ],

    setDomainButtonClicked: [
      ...displayDomainModal,
    ],

    syncButtonClicked: [
      ...updateRockData,
    ],

  })
}
