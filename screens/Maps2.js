import React from 'react';
import MapView, { Marker, Callout  } from 'react-native-maps';
import Heatmap from 'react-native-maps';

import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import {GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {key} from '../googleAPIKey';


// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=AIzaSyC3jftuRYj7vJ5cB-HGvzq6fC60WXOCtoM

export default class Maps2 extends React.Component {

state = {
  latitude: null,
  longitude: null,
  places: null,
  heatPoints: null
}

componentDidMount=()=>{
  this.getPermissionAsync();
 
}
 
componentWillMount = () =>{
  // this.getPermissionAsync();
  navigator.geolocation.getCurrentPosition(
    (postion)=>{
      const lat = postion.coords.latitude;
      const lon = postion.coords.longitude;
      this.setState({latitude: lat, longitude: lon});
      this.getPlaces();
    }
  )
}

getPlaces(){
  const url = this.getUrlWithParameters(this.state.latitude, this.state.longitude, 500, 'food', key);
  fetch(url)
  .then((data)=> data.json())
  .then((res)=>{
    const markersArray = [];
    const heatPoints = [];
    res.results.map((marker, i) => {
      heatPoints.push(
        {
          latitude: marker.geometry.location.lat,
          longitude: marker.geometry.location.lng,
          weight: 10
        }
      )
      
      
      markersArray.push(
        <Marker 
        key = {i}
        coordinate = {{
          latitude: marker.geometry.location.lat,
          longitude: marker.geometry.location.lng
        }}
        >
          <Callout>
            <View>
            <Text>{marker.name}</Text>
            {/* <Text>Open: {marker.opening_hours.open_now ? "YES" : "NO"}</Text> */}
            </View>
          </Callout>
        </Marker>
      )

    })
    this.setState({places: markersArray});
    this.setState({heatPoints: heatPoints});
    // console.log(this.state.heatPoints);
    
  })
}

getUrlWithParameters(lat, lon, radius, type, API){
const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const location = `location=${lat},${lon}&radius=${radius}`;
const typeData = ` &type=${type}`;
const key = `&key=${API}`;
return `${url}${location}${typeData}${key}`;
}


getPermissionAsync = async () => {
  if (Constants.platform.ios) {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      alert('Sorry, we need locations permissions to make this work!');
    }
  }
}

  render() {
    return (
      
      <View style={styles.container}>
        {this.state.latitude ? <MapView showsUserLocation
        provider={"google"}
        style={styles.mapStyle}
        region={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
    }} >
      <Heatmap
      points = {[{
        latitude: 33.6384529,
  longitude: 73.1467504,
      }, {
        latitude: 34.6384529,
  longitude: 73.1467504,
      }, {
        latitude: 36.6384529,
  longitude: 73.1467504,
      }]}
     radius={50}
     opacity={1}
      />
      <Heatmap
      points = {[{
        latitude: 33.6384529,
  longitude: 73.1467504,
      }, {
        latitude: 34.6384529,
  longitude: 73.1467504,
      }, {
        latitude: 36.6384529,
  longitude: 73.1467504,
      }]}
     radius={50}
     opacity={1}
      />
      <Heatmap
      points = {[{
        latitude: 33.6384529,
  longitude: 73.1467504,
      }, {
        latitude: 34.6384529,
  longitude: 73.1467504,
      }, {
        latitude: 36.6384529,
  longitude: 73.1467504,
      }]}
     radius={50}
     opacity={1}
      />
      {this.state.places}
      {/* <Heatmap
      points = {[{
        latitude: 33.6384529,
  longitude: 73.1467504,
  weight: 50
      }]}
     
      /> */}
    </MapView>: null}
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
