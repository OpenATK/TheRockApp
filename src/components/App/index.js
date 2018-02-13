import React from 'react';
import RockMap from '../Map';
import './app.css'
import MenuBar from '../MenuBar'
import {connect} from '@cerebral/react';
import MarkerInput from '../MarkerInput';

export default connect({
}, props => 
  <div className='app'>
    <MenuBar />
    <RockMap />
    <MarkerInput />
  </div>
)

