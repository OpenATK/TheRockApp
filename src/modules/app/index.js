import stateTree from './stateTree.js';

import { initialize } from './chains';
import { addGeohashes } from './chains';
import { removeGeohashes } from './chains';
import { clearCache } from './chains';
import { updateDomainText } from './chains';
import { submitDomainModal } from './chains';
import { cancelDomainModal } from './chains';
import { displayDomainModal } from './chains';

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

  })
}
