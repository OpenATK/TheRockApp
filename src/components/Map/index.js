import React, { Proptypes } from 'react';
import { connect } from 'cerebral-view-react';
import { Map, Marker, CircleMarker, TileLayer, LatLngBounds } from 'react-leaflet';
import { Icon } from 'leaflet';
import styles from './map.css';
import uuid from 'uuid';
import fastyles from '../css/font-awesome.min.css';
import FontAwesome from 'react-fontawesome';
import MarkerInput from '../MarkerInput/';

export default connect(props => ({
  rocks: 'app.model.rocks',
  showAll: 'app.view.show_all_rocks',
  currentLoc: 'app.model.current_location',
  currentToggle: 'app.view.current_location_toggle',
  centerLocation: 'app.model.map_center_location',
  editMode: 'app.view.marker_edit_mode',
}), {
  markerDragged: 'app.markerDragged',
  handleLocationFound: 'app.handleLocationFound',
  mapDragged: 'app.mapDragged',
  currentLocationButtonClicked: 'app.currentLocationButtonClicked',
  rockClicked: 'app.rockClicked',
  boundsFound: 'app.boundsFound'
},

  class RockMap extends React.Component {

    componentDidMount() {
      this.refs.map.leafletElement.locate()
//Get Initial Center Location of Map...
      var centerLat = this.refs.map.getLeafletElement().getCenter().lat;
      var centerLng = this.refs.map.getLeafletElement().getCenter().lng;
      this.props.mapDragged({lat:centerLat, lng:centerLng});
      
      var bounds = this.refs.map.getLeafletElement().getBounds();
      this.props.boundsFound({bounds: bounds});
    }

    render() {
//Add Current Location Marker...
      var currentMarker = [];
      var currentPosition = [this.props.currentLoc.lat, this.props.currentLoc.lng];
      if (currentPosition[0]) {
        currentMarker.push(
          <CircleMarker
            key={uuid.v4()}
            center={currentPosition}
            radius={8}
            opacity={1.0}
            color={"white"}
            weight={2}
            fillColor={"#0080ff"}
            fillOpacity={0.8}
            >
          </CircleMarker>
        );
      }

//Add Rock Marker...
      var rockIcon = L.icon({
        iconUrl: 'rock.png',
        iconAnchor: [12.5, 50],
      });

      var rockPickedIcon = L.icon({
        iconUrl: 'rock_picked.png',
        iconAnchor: [12.5, 50],
      });

      var position = [40.4286882, -86.9137644];
      var rockMarkers = [];

//rocks: rock location array in state tree...
      Object.keys(this.props.rocks).forEach((key) => {
        var rock = this.props.rocks[key];
        rockMarkers.push(
          <Marker 
            key={key}
            position={[rock.location.latitude, rock.location.longitude]}
            draggable={true}
            icon={(rock.picked) ? rockPickedIcon : rockIcon}
            onDragEnd={(e) => this.props.markerDragged({id: key, lat: e.target._latlng.lat, lng: e.target._latlng.lng})}
            onClick={(e) => this.props.rockClicked({id:key})}
            opacity={this.props.showAll || (!this.props.showAll && !rock.picked) ? 1.0 : 0.0}
            >
          </Marker>
        );
      });

      return (
        <div className={styles['map-panel']}>
          <Map 
            dragging={true}
            center={(this.props.currentToggle) ? this.props.centerLocation : position} 
            ref='map'
            zoom={15}
            
            onLocationfound={(e) => this.props.handleLocationFound({lat:e.latlng.lat, lng:e.latlng.lng})}
            onMoveend={(this.refs.map) ? (() => this.props.mapDragged({lat:this.refs.map.getLeafletElement().getCenter().lat, lng: this.refs.map.getLeafletElement().getCenter().lng, bounds: this.refs.map.getLeafletElement().getBounds()})) : console.log("")}
            >

            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
            <button
              className={styles['gps-button']}
              onClick={() => this.props.currentLocationButtonClicked({})}
            />
            {rockMarkers}
            {currentMarker}
            <div className={styles[(this.props.editMode) ? 'edit-panel' : 'hidden']}>
              <MarkerInput />
            </div>
          </Map>
        </div>
      );
    }
  }
)
