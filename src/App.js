/* eslint-disable no-undef */
import React, { Component } from 'react';
import './App.css';
import Modal from './components/Modal';

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
        zoom: 14,
        searchValue: 'Restaurants',
        searchListElements: [],
        isModalOpen: false,
        selectedElement: {photos:[]},
      }
  }

  componentDidMount() {
      // create the map, marker and infoWindow after the component has
      // been rendered because we need to manipulate the DOM for Google
      this.map = this.createMap();
      this.markers = [this.createMarker()];
      this.infoWindow = new google.maps.InfoWindow();
      this.searchEntity();

      google.maps.event.addListener(this.map, 'zoom_changed', ()=> this.handleZoomChange())
  }

  componentDidUnMount() {
    google.maps.event.clearListeners(map, 'zoom_changed')
  }

  createMap() {
    let mapOptions = {
      zoom: this.state.zoom,
      center: this.mapCenter()
    }
    return new google.maps.Map(this.refs.mapCanvas, mapOptions)
  }

  mapCenter() {
    return new google.maps.LatLng(
      this.props.initialCenter.lat,
      this.props.initialCenter.lng
    )
  }

  createMarker() {
    return new google.maps.Marker({
      position: this.mapCenter(),
      map: this.map
    })
	}

  handleZoomChange() {
    this.setState({
      zoom: this.map.getZoom()
    })
  }

  searchNearbyPlacesCallBack(results, status) {
    var bounds = new google.maps.LatLngBounds();
    this.resetMarker();

    if (status == google.maps.places.PlacesServiceStatus.OK) {
      this.setState({
        searchListElements: results
      })
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var place = results[i];
        this.fitMapBounds(place, bounds);
        this.createSearchNearbyPlacesMarker(place);
      }

      this.map.fitBounds(bounds);
    }
  }

  createSearchNearbyPlacesMarker(place) {
        var marker = new google.maps.Marker({
          map: this.map,
          position: place.geometry.location
        });

        this.markers.push(marker);

        google.maps.event.addListener(marker, 'click', function() {
          this.infoWindow.setContent(place.name);
          this.infoWindow.open(this.map, marker);
        }.bind(this));
  }

  inputChange(e) {
    this.setState({
      searchValue: e.target.value
    });
  }

  searchEntity(e) {
    var currentLatLng = new google.maps.LatLng(this.props.initialCenter.lat,this.props.initialCenter.lng);
    var request = {
      location: currentLatLng,
      radius: '200',
      query: this.state.searchValue
    };

    var service = new google.maps.places.PlacesService(this.map);
    service.textSearch(request, this.searchNearbyPlacesCallBack.bind(this));
  }

  resetMarker() {
    this.markers.forEach(function(marker) {
      marker.setMap(null);
    });
    this.markers = [];
  }

  fitMapBounds(element, bounds) {
    if (element.geometry.viewport)
        bounds.union(element.geometry.viewport);
    else
        bounds.extend(element.geometry.location);
  }

  listClicked(element, e) {
    var bounds = new google.maps.LatLngBounds();
    this.resetMarker();
    this.fitMapBounds(element, bounds);
    this.map.fitBounds(bounds);

    var marker = new google.maps.Marker({
      map: this.map,
      position: element.geometry.location
    });
    this.markers.push(marker);
    this.openModal();

    this.setState({
      selectedElement: element,
    });
  }

  openModal() {
      this.setState({ isModalOpen: true })
  }

  closeModal() {
      this.setState({ isModalOpen: false })
  }

  render() {
    let state = this.state;
    return (
      <div className="GMap">
        <div className="form-inline search-area">
          <p>Search</p>
          <input className="form-control" value={state.searchValue} onChange={this.inputChange.bind(this)} />
          <button type="button" className="btn btn-success" onClick={this.searchEntity.bind(this)}>Search</button>
          <div><img style={{width: 120}} src={require('./powered_by_google.png')} /></div>
        </div>
        <div className="list">
          <ul className="list-group">
            {
              state.searchListElements.map((element) => {
                return (
                  <li key={element.id} className="list-group-item" onClick={this.listClicked.bind(this, element)}>
                    <div style={{textTransform: 'uppercase'}}>{element.name}</div>
                    <div className="rating">Rating: {element.rating}</div>
                  </li>
                )
              })
            }
          </ul>
        </div>

        <Modal isOpen={state.isModalOpen} onClose={() => this.closeModal()}>
            <div className="modal-wrapper">
              <div className="modal-header">
                {state.selectedElement.name}
                <div className="rating">Rating: {state.selectedElement.rating}</div>
              </div>
              <div className="modal-content">
                {
                  state.selectedElement.photos.map((photo, i) => {
                    return(
                      <img key={i} src={photo.getUrl({maxWidth: 600, maxHeight: 200})} />
                    )
                  })
                }
                <p>{state.selectedElement.formatted_address}</p>
              </div>
              <div className="modal-footer">
                <p style={{float: 'right'}}><button type="button" className="btn btn-danger" onClick={() => this.closeModal()}>Close</button></p>
              </div>
            </div>
        </Modal>

        <div className='GMap-canvas' ref="mapCanvas">
        </div>
    </div>
    );
  }
}

export default App;
