import React, { Component } from "react";
import {
    View,
    StyleSheet,
    Image,
    Dimensions
} from "react-native";
import StarRating from 'react-native-star-rating'

import { SliderBox } from "react-native-image-slider-box";
import MapView, { Marker, Callout  } from 'react-native-maps';
import {key} from '../googleAPIKey';
import * as Permissions from 'expo-permissions';

import * as Location from 'expo-location';
import * as firebase from 'firebase';

import { Button, Block, Text, theme } from "galio-framework";

import {  Icon, Input } from "../components";
const { width } = Dimensions.get('screen');
import Polyline from '@mapbox/polyline'
import getDirections from 'react-native-google-maps-directions'


class TourNavigation extends Component {

    userId = firebase.auth().currentUser.uid;

    firestoreUserRef = firebase.firestore().collection("users");
    currentUserRef = firebase.firestore().collection("users").doc(this.userId);


    
    state = {
        gotLoc: false,
        destination: this.props.navigation.getParam("destination"),
        currentLoc: {coordinates:{
            lat: 33.7126467,
            lng: 73.0871031,
        }},
        startPostion: "",
        endPosition: "",
        directionCoords:[],
        membersMarkers:[],
        
        members: this.props.navigation.getParam("members"),
        location:{
            latitude: 33.7126467,
            longitude: 73.0871031,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
        },
        rating:0,

        mapRegion: { 
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }
      };



    //   handleGetDirections = () => {
    //     const data = {
    //        source: {
    //         latitude: -33.8356372,
    //         longitude: 18.6947617
    //       },
    //       destination: {
    //         latitude: -33.8600024,
    //         longitude: 18.697459
    //       },
    //       params: [
    //         {
    //           key: "travelmode",
    //           value: "driving"        // may be "walking", "bicycling" or "transit" as well
    //         },
    //         {
    //           key: "dir_action",
    //           value: "navigate"       // this instantly initializes navigation using the given travel mode
    //         }
    //       ],
    //       waypoints: [
    //         {
    //           latitude: -33.8600025,
    //           longitude: 18.697452
    //         },
    //         {
    //           latitude: -33.8600026,
    //           longitude: 18.697453
    //         },
    //            {
    //           latitude: -33.8600036,
    //           longitude: 18.697493
    //         }
    //       ]
    //     }
     
    //     // getDirections(data)
    //   }

      mergeLoc = (callback)=>{
        const concatStartLoc = this.state.currentLoc.coordinates.lat +","+this.state.currentLoc.coordinates.lng;
        const concatDestLoc = this.state.destination.coordinates.lat +","+this.state.destination.coordinates.lng;
        console.log(concatStartLoc+"        "+concatDestLoc);
        this.setState({
          startPostion: concatStartLoc,
          endPosition: concatDestLoc
        }, ()=>{callback()});

        
      }

      getMembersLoc = ()=>{
          const members = this.state.members;
        //   console.log("MEBERS>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",members)
          const userMarkers = [];

          members.forEach((user, index) => {
            this.firestoreUserRef.doc(user.userId).get().then((doc)=>{
                let docData = doc.data();
                
                if(docData.location){
                //   console.log(docData.location);
          
                let latitude = docData.location.latitude;
                let longitude = docData.location.longitude;
                let userName = docData.username;
                let lastSeen = docData.location.lastSeen
          
                userMarkers.push(
                  <Marker 
                  key = {index}
                  coordinate = {{
                    latitude: latitude,
                    longitude: longitude
                  }}
                  >
                          <Image source={require('../assets/imgs/profilePic.png')} style={{height: 30, width:30, borderRadius:15 }} />

                    <Callout>
                      <View style={{borderRadius:5}}>
                      <Text>{userName}</Text>
                      <Text>Last Seen: {lastSeen}</Text>
                      {/* <Text>Open: {marker.opening_hours.open_now ? "YES" : "NO"}</Text> */}
                      </View>
                    </Callout>
                  </Marker>
                );
                
            // console.log(userMarkers);  
            this.setState({membersMarkers: userMarkers});
              
            }}); 
           
      }) }
      

      getMyDirections = async (startLoc, destinationLoc) =>{

        try {
            console.log(`https://maps.googleapis.com/maps/api/directions/json?origin=${ this.state.startPostion }&destination=${ this.state.endPosition }&key=${key}`);
            let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&key=${key}`)
            let respJson = await resp.json();
            let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
            let coords = points.map((point, index) => {
                return  {
                    latitude : point[0],
                    longitude : point[1]
                }
            })
            this.setState({directionCoords: coords})
            return coords
        } catch(error) {
            console.log(error)
            return error
        }
    }

    startTour =()=>{
        const data = {
                   source: {
                    latitude: this.state.currentLoc.coordinates.lat,
                    longitude: this.state.currentLoc.coordinates.lng
                  },
                  destination: {
                    latitude: this.state.destination.coordinates.lat,
                    longitude: this.state.destination.coordinates.lng
                  },
                  params: [
                    {
                      key: "travelmode",
                      value: "driving"        // may be "walking", "bicycling" or "transit" as well
                    },
                    {
                      key: "dir_action",
                      value: "navigate"       // this instantly initializes navigation using the given travel mode
                    }
                  ],
                //   waypss
                }
        getDirections(data);
    }

    
    ///GETTING TIME FROM TIMESTAMP

    pad = (num)=> { 
        return ("0"+num).slice(-2);
    }
    getTimeFromDate = (timestamp) => {
        var date = new Date(timestamp * 1000);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        // return this.pad(hours)+":"+this.pad(minutes)+":"+this.pad(seconds)
        return this.pad(hours)+":"+this.pad(minutes);
    }

    componentWillMount = ()=>{
        // navigator.geolocation.getCurrentPosition(
        //     (position) => {
                
        //       console.log("wokeeey");
        //       console.log(position);
        //       let locObj = {coordinates:{lat: position.coords.latitude , lng:position.coords.longitude}}
        //       console.log(locObj);
        //       this.setState({
        //         currentLoc: locObj,gotLoc: true
        //       });
        //       console.log(this.state.currentLoc);
        //     },
        //     { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
        //   );
        // if(this.state.gotLoc){
        this.getCurrentLocationAsync(()=>{
            this.mergeLoc(()=>{
                // console.log("fjbfjkasbfkjbfjkabf"+this.state.startPostion)
                this.getMyDirections(this.state.startPostion, this.state.endPosition);
                // console.log(this.state.directionCoords);
            
        });
        });
        this.getMembersLoc()
            
       
        }

    getCurrentLocationAsync = async(callback)=>{
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    this.setState({
      errorMessage: 'Permission to access location was denied',
    });
  }

  let location = await Location.getCurrentPositionAsync({});
  let time = this.getTimeFromDate(location.timestamp);
  let region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
  }
  let currentLoc = {coordinates:{
      lat: location.coords.latitude,
      lng: location.coords.longitude
  }}
  
    this.currentUserRef.set({
    location: {latitude: location.coords.latitude, longitude: location.coords.longitude, lastSeen: time}
  }, { merge: true }).then(()=>{console.log("updated location!")});


  this.setState({ currentLoc: currentLoc , location: region}, ()=>{callback()});

  
    
  
    }




    componentDidMount =()=>{
        // this.mergeLoc();
        // this.getCurrentLocationAsync();
        // if(this.state.startPostion!=null&&this.state.endPostion!=null){
        //     this.getMyDirections(this.state.startPostion, this.state.endPosition);
        //     console.log(this.state.directionCoords);
        // }   

    }


    render() {
        return (

            <Block center style={styles.home}>

                <Block shadow center style={{marginTop: 5}} >
                            <MapView  showsUserLocation
                                provider={"google"}
                                style={styles.mapStyle}
                                region={this.state.location}
                                showsUserLocation
                                showsMyLocationButton
                                showsPointsOfInterest
                                // onRegionChange={this.onRegionChange}
                                // onUserLocationChange={this.handleChangeLocation}
                                >
                                    {/* <Marker 
                                        coordinate = {{
                                        latitude: this.state.currentLoc.coordinates.lat,
                                        longitude: this.state.currentLoc.coordinates.lng
                                        }}
                                        title={this.state.name}
                                    >
                                    </Marker> */}
                                    {this.state.membersMarkers}
                                    <Marker 
                                    coordinate = {{
                                      latitude: this.state.destination.coordinates.lat,
                                      longitude: this.state.destination.coordinates.lng
                                    }}
                                    >
                                      <Callout>
                                        <View style={{borderRadius:5}}>
                                          <Text>Destination</Text>
                                        </View>
                                      </Callout>
                                    </Marker>
                                    <MapView.Polyline
                                        coordinates={this.state.directionCoords}
                                        strokeWidth={2}
                                        strokeColor="red"/>

                                    {/* {this.state.followingUserMarkers} */}
                            </MapView>   
                </Block>
                <Block style={{margin: 10}}>
                    <Button round size="small"  color="tomato" shadowless onPress={this.startTour}>Navigate</Button>
                </Block>
            </Block>
        );
    }
}
export default TourNavigation;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // alignItems: 'center',
        justifyContent: 'center',
        
    },
    home: {
        width: width,    
      },
      articles: {
        width: width,
        paddingVertical: theme.SIZES.BASE,
      },
      mapStyle: {
        borderRadius: 4,
        width: Dimensions.get('window').width*0.9,
        height: Dimensions.get('window').height*0.7,
      },
});