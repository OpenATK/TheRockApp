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
  centerLocation: 'app.model.map_center_location',
  addMode: 'app.view.add_mode',
}), {
  addRockButtonClicked: 'app.addRockButtonClicked',
  mapClicked: 'app.mapClicked',
  markerDragged: 'app.markerDragged',
  markerClicked: 'app.markerClicked',
  handleLocationFound: 'app.handleLocationFound',
  mapDragged: 'app.mapDragged',
},

  class RockMap extends React.Component {

    componentDidMount() {
      this.refs.map.leafletElement.locate()
      //console.log(this.refs.map.getLeafletElement().getCenter());
      //console.log(this);
      //var centerLat = this.refs.map.getLeafletElement().getCenter().lat;
      //var centerLng = this.refs.map.getLeafletElement().getCenter().lng;
      //console.log(centerLat);
      //console.log(centerLng);
    }

    render() {
//Get Initial Center Location of Map...
      if (this.refs.map) {
        console.log(this.refs.map.getLeafletElement().getCenter());
        var centerLat = this.refs.map.getLeafletElement().getCenter().lat;
        var centerLng = this.refs.map.getLeafletElement().getCenter().lng;
      }

//Add Current Location Marker...
      var currentMarker = [];
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

//Add Rock Marker...
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

      var position = [40.4286882, -86.9137644];
      var rockMarkers = [];

//rocks: rock location array in state tree...
      this.props.rocks.forEach((rock, i) => {
        var rock; //...each rock location
        var rockPosition = [rock.location.lat, rock.location.lng];
        var rockPickStatus = true;  //...rock unpicked
        if (rock.location.status == 'picked') {
        	rockPickStatus = false;  //...rock picked
        } else {
        	rockPickStatus = true;
        }
        var showRock = true;
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

      return (
        <div className={styles['map-panel']}>
          <Map 
            dragging={true}
            center={(this.props.currentToggle) ? this.props.mapLocation : position} 
            ref='map'
            zoom={15}
            onClick={(e) => this.props.mapClicked({lat: e.latlng.lat, lng: e.latlng.lng})}
            onLocationfound={(e) => this.props.handleLocationFound({lat:e.latlng.lat, lng:e.latlng.lng})}
            onLoad={(this.refs.map) ? (() => this.props.mapDragged({lat: centerLat, lng: centerLng})) : console.log("NOT YET")}
            onDragEnd={(this.refs.map) ? (() => this.props.mapDragged({lat:this.refs.map.getLeafletElement().getCenter().lat, lng: this.refs.map.getLeafletElement().getCenter().lng})) : console.log("NOT YET")}
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
