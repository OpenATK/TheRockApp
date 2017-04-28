import React from 'react';
import { connect } from 'cerebral/react';
import styles from './styles.css';
import {state, signal} from 'cerebral/tags';

export default connect({
  text: state`app.view.domain_modal.text`,
  visible: state`app.view.domain_modal.visible`,
  textChanged: signal`app.domainTextChanged`,
  domainSubmitClicked: signal`app.domainSubmitClicked`,
  domainCancelClicked: signal`app.domainCancelClicked`,
},

class OadaDomainModal extends React.Component {
  render() {
    return(
      <div className={styles[(this.props.visible) ? 'oada-domain-screen' : 'hidden']}>
        <div className={styles[(this.props.visible) ? 'oada-domain-modal' : 'hidden']}>
          OADA server domain: 
          <br />
          <span 
            className={styles['subtext']}>
            (e.g. oada-dev.com)
          </span>
          <input 
            type='text' 
            value={this.props.text} 
            onChange={(e) => this.props.textChanged({value: e.target.value})}
          />
          <br />
          <button 
            className={styles['submit-button']}
            type='button'
            onClick={() => this.props.domainSubmitClicked({value:this.props.text})}>
            Submit
          </button>
          <button 
            className={styles['cancel-button']}
            type='button'
            onClick={() => this.props.domainCancelClicked({value:'NotNow'})}>
            Not Now 
          </button>
        </div>
      </div>
    )
  }
})
