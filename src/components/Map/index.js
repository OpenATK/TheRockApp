import React, { Proptypes } from 'react';
import { connect } from 'cerebral-view-react';
import { Map, Marker, TileLayer} from 'react-leaflet';
import { Icon } from 'leaflet';
import styles from './map.css';
import uuid from 'uuid';
import fastyles from '../css/font-awesome.min.css';
import FontAwesome from 'react-fontawesome';

export default connect(props => ({
  legend: 'app.view.legends.elevation',
  dataIndex: 'app.model.data_index',
  rocks: 'app.model.rocks',
}), {
  addRockButtonClicked: 'app.addRockButtonClicked',
  mapClicked: 'app.mapClicked',
  markerDragged: 'app.markerDragged',
},

  class RockMap extends React.Component {

    render() {
      var rockIcon = L.icon({
        iconUrl: 'rock.png',
        iconAnchor: [12.5, 50],
        //iconSize: [50, 50], // size of the icon
      });

      var self = this;
      var position = [40.853989, -86.142021];
      var rockMarkers = [];
      console.log(this.props.rocks);

      this.props.rocks.forEach((rock, i) => {
        var rock;
        var position = [rock.location.lat, rock.location.lng];
        rockMarkers.push(
          <Marker 
            key={uuid.v4()}
            position={position}
            draggable={true}
            icon={rockIcon}
            onDragEnd={(e) => this.props.markerDragged({lat: e.target._latlng.lat, lng: e.target._latlng.lng, index: i})}
            >
          </Marker>
        );
      });

      
      return (
        <div className={styles['map-panel']}>
          <button 
            onClick={() => this.props.addRockButtonClicked({})}
            >
            Add Rock
          </button>

          <Map 
            dragging={true}
            center={position} 
            ref='map'
            zoom={15}
            onClick={(e) => this.props.mapClicked({lat: e.latlng.lat, lng: e.latlng.lng})}
            >

            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
            {rockMarkers}
          </Map>
        </div>
      );
    }
  }
)
