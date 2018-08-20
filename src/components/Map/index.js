import React from 'react';
import _ from 'lodash';
import { connect } from '@cerebral/react';
import {state, signal} from 'cerebral/tags';
import uuid from 'uuid';
import Leaflet from 'leaflet';
import { Map, Marker, CircleMarker, TileLayer } from 'react-leaflet';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import './Map.css';
import rockIcon from '../../icons/rock.png';
import pickedRockIcon from '../../icons/pickedRock.png';

const styles = theme => ({
  mapContainer: {
    display: 'flex',
    order: '1',
    width: '100%',
    height: '100%',
  },
  map: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
});

class RockMap extends React.Component {

  componentDidMount() {
    this.refs.map.leafletElement.locate()
	 	
    //We track leaflet state to use in the react app  
    this.props.trackMapPosition({
      lat: this.refs.map.leafletElement.getCenter().lat,
      lng: this.refs.map.leafletElement.getCenter().lng,
      bounds: this.refs.map.leafletElement.getBounds()
    });
  }    

  render() {
    const { classes } = this.props;
   
    //Set our Map center
    const targetLatitude = this.props.targetCenter.lat;
    const targetLongitude = this.props.targetCenter.lng;
    const targetPosition = [targetLatitude, targetLongitude];

    //Add Current Location Marker
    const currentMarker = [];
    var currentPosition = [];
    if (this.props.current_location_state) {
      currentPosition = [
        this.props.currentLoc.lat, 
        this.props.currentLoc.lng
      ]
    } else {
      currentPosition = [
        40.1234, 
        -86.12342
      ]
    };
        
    currentMarker.push(
      <CircleMarker
        key={uuid.v4}
        center={currentPosition}
        radius={8}
        opacity={1.0}
        color={"white"}
        weight={2}
        fillColor={'#0080ff'}
        fillOpacity={0.8}>
      </CircleMarker>
    );
      
    //Create the rock Markers
    const unpickedRock = Leaflet.icon({
      iconUrl: rockIcon,
      iconAnchor: [18, 50]
    });

    const pickedRock = Leaflet.icon({
      iconUrl: pickedRockIcon,
      iconAnchor: [18, 50] 	     
    });

    //This section handles what rockmarkers are mapped, what they look like, and when.
    const assembleMarkerArray = (rock, key) => {
      //Selectivly chooses what rocks to render based on current state
      if (rock.picked && !this.props.showAll){
      } else if (this.props.editing && key !== this.props.currentKey) {
      } else if (!rock.location) {
      } else {
        rockMarkers.push(
          <Marker
            key={key}
            position={[rock.location.lat, rock.location.lng]}
            draggable={this.props.editing ? false : true}
            icon={(rock.picked) ? pickedRock : unpickedRock}
            onDragEnd={(e) => this.props.resetRockLocation({id: key, lat: e.target._latlng.lat, lng: e.target._latlng.lng})}
            onClick={(e) => this.props.startEditing({id: key})} 
          >
          </Marker>
        );
      }
    }

    const rockMarkers= [];
    if (this.props.rocks) {
      _.map(this.props.rocks, (rock,key) => {
        assembleMarkerArray(rock, key)
      });  
    }
 
    //This allows for tracking of map position
    const moveEnd = () => { 
      if (!this.refs.map) return;
      this.props.trackMapPosition({
        lat: this.refs.map.leafletElement.getCenter().lat,
        lng: this.refs.map.leafletElement.getCenter().lng,
        bounds: this.refs.map.leafletElement.getBounds()
      });
    }
      
    return (
		
      <div className={classes.map}>
        <Map
          dragging={true}
          center={targetPosition} 
          ref='map'
          zoom={18}           
          onLocationfound={(e) => this.props.storeUserLocation({lat:e.latlng.lat, lng:e.latlng.lng})}
          onMoveend={moveEnd}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />
          {rockMarkers}
          {currentMarker}
        </Map>
      </div>
			
    );
  }
}

RockMap.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default connect({
                   rocks: state`rocks.records`,
                 showAll: state`session.show_all_rocks`,
              currentLoc: state`session.current_location`,
  current_location_state: state`session.current_location_state`,
            targetCenter: state`session.target_map_center`,
		             editing: state`session.marker_edit_mode`,
		          currentKey: state`session.selected_key`,

  resetRockLocation: signal`rocks.resetRockLocation`,
  storeUserLocation: signal`session.storeUserLocation`,
   trackMapPosition: signal`session.trackMapPosition`,
       startEditing: signal`session.startEditing`,
  },
  withStyles(styles, { withTheme: true })(RockMap)
);


