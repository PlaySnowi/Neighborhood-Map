import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader';
import './App.css';

class App extends Component {

  state = {
    mapIsReady: false,
    //these are the restaurant listings that will be shown to the user
    locations: [
      { title: 'Real Hamburgueria Portuguesa', location: {lat: 41.152565, lng: -8.620043}, category: 'Burger'} ,
      { title: 'Santo Burga', location: {lat: 41.197335, lng: -8.709368}, category: 'Burger' },
      { title: 'Mendi', location: {lat: 41.160475, lng: -8.640309}, category: 'Indian' },
      { title: 'Real Indiana', location: {lat: 41.159654, lng: -8.68377}, category: 'Indian' },
      { title: 'Portarossa', location: {lat: 41.156569, lng: -8.676524}, category: 'Italian' }
    ],
    //create a new blank array for all the listing markers
    markers:[],
    query: '',
    infoWindow: {}
  };

  updateQuery = (query) => {
    this.setState({ query })
  }

  /*
   * This function populates the infowindow when the marker is clicked.
   * We'll only allow one infowindow which will open at the marker that is clicked,
   * and populate based on that markers position
   */
  populateInfoWindow = (marker, infowindow) => {
    //check to make sure the infowindow is not already opened on this marker
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(this.map, marker);
      //make sure the marker property is cleared if the infowindow is closed
      infowindow.addListener('closeclick',function(){
        infowindow.marker = null;
      });
    }
  }

  componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {
    if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished
      if (isScriptLoadSucceed) {
        this.initApp()
      }
      else this.props.onError()
    }
  }

  componentDidMount () {
    const { isScriptLoaded, isScriptLoadSucceed } = this.props
    if (isScriptLoaded && isScriptLoadSucceed) {
      this.initApp()
    }
  }

  initApp() {
      //constructor creates a new map
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.157944, lng: -8.629105},
        zoom: 12,
        mapTypeControl: false
      });
      
      this.setState({
        infoWindow: new window.google.maps.InfoWindow()
      });
      
      const bounds = new window.google.maps.LatLngBounds();
      
      //the following group uses the location array to create an array of markers on initialize
      for (let i = 0; i < this.state.locations.length; i++) {
        //get the position from the location array
        let position = this.state.locations[i].location;
        let title = this.state.locations[i].title;
        
        //create a marker per location, and put into markers array
        const marker = new window.google.maps.Marker({
          map: this.map,
          position: position,
          title: title
        });

        //push the marker to our array of markers  
        this.setState(state => ({
          markers: state.markers.concat(marker)
        }))

        const theApp = this;

        //create an onclick event to open an infowindow at each marker
        marker.addListener('click', function() {
          theApp.populateInfoWindow(marker, theApp.state.infoWindow);
        });

        bounds.extend(marker.position);
      }
      //extend the boundaries of the map for each marker
      this.map.fitBounds(bounds);

      //on clicking a list item, run openInfoWindow function
      document.querySelector('.list').addEventListener('click', function(e) {
        openInfoWindow(e)
      })
    
      const openInfoWindow = (e) => {
        //returns the index of the marker that matches the clicked list item
        const markerIndex = this.state.markers.findIndex(marker => marker.title === e.target.innerText)
        //runs populateInfoWindow function for the matched marker
        this.populateInfoWindow(this.state.markers[markerIndex], this.state.infoWindow)
      }
  }

  render(){
      
    if (this.state.query) {//if there is some input
      this.state.locations.forEach((local, i) => {
        if (local.title.toLowerCase().includes(this.state.query.toLowerCase())) {//if the string matches the input,
          this.state.markers[i].setVisible(true)//show matched markers
        } else {//if the string doesn't match the input
          if (this.state.infoWindow.marker === this.state.markers[i]) {//if there are opened infowindows for markers that don't match,
            this.state.infoWindow.close()//close those infowindows
          }
          this.state.markers[i].setVisible(false)
        }
      })
    } else {//if there is no input,
      this.state.locations.forEach((local, i) => {
        if (this.state.markers.length) {
          this.state.markers[i].setVisible(true)//show all markers
        }
      })
    }

      return(
        <div className="App">
          <aside className="App-aside">
            <h1 className="App-title">Welcome to React</h1>
            <input
              type="text"
              value={this.state.query}
              onChange={(event) => this.updateQuery(event.target.value)}
            />
            <ul className="list">
              {this.state.markers.map((marker, i) => (
                <li key={i}>
                  {marker.title}
                </li>
              ))}
            </ul>
          </aside>
          <div id="map"></div>
        </div>
      )
  }
}

export default scriptLoader(
    ["https://maps.googleapis.com/maps/api/js?key=AIzaSyCI3eIrMweOmEiMl3DzWe152eYEVbYCqjc"]
)(App)