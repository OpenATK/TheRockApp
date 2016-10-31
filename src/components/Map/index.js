import React, { Proptypes } from 'react';
import { connect } from 'cerebral-view-react';
import { Map, Marker, TileLayer} from 'react-leaflet';
import { Icon } from 'leaflet';
import styles from './map.css';
import uuid from 'uuid';
import fastyles from '../css/font-awesome.min.css';
import FontAwesome from 'react-fontawesome';

export default connect(props => ({
  rocks: 'app.model.rocks',
  hideMode: 'app.view.hide_mode',
  currentLoc: 'app.model.current_location',
  mapLocation: 'app.model.map_location',
  currentToggle: 'app.view.current_location_toggle',
}), {
  addRockButtonClicked: 'app.addRockButtonClicked',
  mapClicked: 'app.mapClicked',
  markerDragged: 'app.markerDragged',
  markerClicked: 'app.markerClicked',
  handleLocationFound: 'app.handleLocationFound',
},

  class RockMap extends React.Component {

    componentDidMount() {
      this.refs.map.leafletElement.locate()
    }

    render() {
      var currentMarker = [];
      //var currentMarker = (this.props.currentToggle) ? () : null;
      var currentPosition = [this.props.mapLocation.lat, this.props.mapLocation.lng];
      if (this.props.currentToggle) {
        currentMarker.push(
          <Marker
            key={uuid.v4()}
            position={currentPosition}
            >
          </Marker>
        );
      }

      var rockIcon = L.icon({
        iconUrl: 'rock.png',
        iconAnchor: [12.5, 50],
        //iconSize: [50, 50], // size of the icon
      });

      var rockPickedIcon = L.icon({
        iconUrl: 'rock_picked.png',
        iconAnchor: [12.5, 50],
        //iconSize: [50, 50], // size of the icon
      });

      var self = this;
      var position = [40.4286882, -86.9137644];
      var rockMarkers = [];
      //console.log(this.props.rocks);


      this.props.rocks.forEach((rock, i) => {
        var rock;
        var rockPosition = [rock.location.lat, rock.location.lng];
        var rockPickStatus = true;  //rock unpicked
        //console.log(rock);
        if (rock.location.status == 'picked') {
        	rockPickStatus = false;  //rock picked
        } else {
        	rockPickStatus = true;
        }
        var showRock = true;
        //console.log(this.props.hideMode);
        if (this.props.hideMode) {
          if (rockPickStatus == false) {
          	showRock = false;
          } else {
          	showRock = true;
          }
        }
        rockMarkers.push(
          <Marker 
            key={uuid.v4()}
            position={rockPosition}
            draggable={true}
            icon={(rockPickStatus) ? rockIcon : rockPickedIcon}
            onDragEnd={(e) => this.props.markerDragged({lat: e.target._latlng.lat, lng: e.target._latlng.lng, index: i})}
            onClick={(e) => this.props.markerClicked({index: i})}
            opacity={(showRock) ? 1.0 : 0.0}
            >
          </Marker>
        );
      });

      //center={(this.props.mapLocation) ? this.props.mapLocation : position}
      //{currentMarker}
      //console.log(this.props.mapLocation);
      return (
        <div className={styles['map-panel']}>
          <Map 
            dragging={true}
            center={(this.props.currentToggle) ? this.props.mapLocation : position} 
            ref='map'
            zoom={15}
            onClick={(e) => this.props.mapClicked({lat: e.latlng.lat, lng: e.latlng.lng})}
            onLocationfound={(e) => this.props.handleLocationFound({lat:e.latlng.lat, lng:e.latlng.lng})}
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
)
