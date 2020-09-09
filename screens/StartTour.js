import React, { Component } from "react";
import { View, StyleSheet, Image, Dimensions, Alert } from "react-native";
import StarRating from "react-native-star-rating";

import { SliderBox } from "react-native-image-slider-box";
import MapView, { Marker, Callout } from "react-native-maps";
import { key } from "../googleAPIKey";
import * as Permissions from "expo-permissions";

import * as Location from "expo-location";
import * as firebase from "firebase";

import { Button, Block, Text, theme } from "galio-framework";

import { Icon, Input } from "../components";
const { width } = Dimensions.get("screen");
import Polyline from "@mapbox/polyline";
import getDirections from "react-native-google-maps-directions";
import { SafeAreaView } from "react-navigation";
import { ScrollView } from "react-native-gesture-handler";
import { ListItem } from "react-native-elements";

class StartTour extends Component {
  userId = firebase.auth().currentUser.uid;

  firestoreUserRef = firebase.firestore().collection("users");
  currentUserRef = firebase.firestore().collection("users").doc(this.userId);

  state = {
    gotLoc: false,
    destination: this.props.navigation.getParam("destination"),
    destinationId: this.props.navigation.getParam("destinationId"),
    spots: this.props.navigation.getParam("spots"),
    nearbySpots: [],
    planId: this.props.navigation.getParam("planId"),
    destinationName: this.props.navigation.getParam("destinationName"),
    currentLoc: {
      coordinates: {
        lat: 33.7126467,
        lng: 73.0871031,
      },
    },
    startPostion: "",
    endPosition: "",
    currentSpotPosition: "",
    directionCoords: [],
    spotCoords: [],
    membersMarkers: [],
    spotMarkers: [],
    members: this.props.navigation.getParam("members"),
    creatorId: this.props.navigation.getParam("creatorId"),
    membersData: [],
    location: {
      latitude: 33.7126467,
      longitude: 73.0871031,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    rating: 0,

    mapRegion: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
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

  mergeLoc = (callback) => {
    const concatStartLoc =
      this.state.currentLoc.coordinates.lat +
      "," +
      this.state.currentLoc.coordinates.lng;
    const concatDestLoc =
      this.state.destination.latitude + "," + this.state.destination.longitude;
    console.log(concatStartLoc + "        " + concatDestLoc);
    this.setState(
      {
        startPostion: concatStartLoc,
        endPosition: concatDestLoc,
      },
      () => {
        callback();
      }
    );
  };

  getFormattedSpotLocation = (spot) => {
    const concatSpotLoc =
      spot.location.latitude + "," + spot.location.longitude;
    this.setState({ currentSpotPosition: concatSpotLoc });
  };

  generateSpotDirections = async (spot) => {
    this.getFormattedSpotLocation(spot);
    console.log("Concatted Spot: ", this.state.currentSpotPosition);

    let location = await Location.getCurrentPositionAsync({});

    this.getSpotDirections(
      `${location.coords.latitude},${location.coords.longitude}`,
      this.state.currentSpotPosition
    );
  };

  generateSpotMarkers = () => {
    const spots = this.state.spots;
    const spotMarkers = [];

    spots.forEach((spot) => {
      spotMarkers.push(
        <Marker
          key={spot.place_id}
          coordinate={{
            latitude: spot.location.latitude,
            longitude: spot.location.longitude,
          }}
        >
          <Image
            source={require("../assets/imgs/spot.png")}
            style={{ height: 30, width: 30, borderRadius: 15 }}
          />

          <Callout
            style={{ width: 100 }}
            onPress={() => {
              this.generateSpotDirections(spot);
            }}
          >
            <Text>{spot.name}</Text>
          </Callout>
        </Marker>
      );
    });

    this.setState({ spotMarkers: spotMarkers });
  };

  getNearestSpots = async () => {
    let spots = this.state.spots;
    let currLocation = await Location.getCurrentPositionAsync({});
    let nearbySpots = [];
    spots.forEach((spot) => {
      let distance = this.calDistance(
        currLocation.coords.latitude,
        currLocation.coords.longitude,
        spot.location.latitude,
        spot.location.longitude,
        "K"
      );
      if (distance < 100) {
        // less than 20 Km
        nearbySpots.push(spot);
      }
    });

    this.setState({ nearbySpots: nearbySpots });
  };

  renderMembersList = () => {
    return (
      <Block
        center
        style={{
          width: width * 0.8,
          backgroundColor: "#f7f7f7",
          borderRadius: 10,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.membersData &&
            this.state.membersData.map((u, i) => {
              return (
                <Block left row key={i}>
                  <ListItem
                    containerStyle={{
                      width: width * 0.5,
                      backgroundColor: "#f7f7f7",
                      borderRadius: 10,
                    }}
                    title={u.username}
                    leftAvatar={{ source: { uri: u.avatar } }}
                  />
                  <Block row>
                    <Button
                      onlyIcon
                      icon="car"
                      iconFamily="antdesign"
                      iconSize={20}
                      color="#3BBDE3"
                      iconColor="#fff"
                      shadowless
                      style={{
                        width: 40,
                        height: 40,
                        marginRight: 5,
                        marginTop: 12,
                      }}
                      onPress={() => {
                        this.startTour(
                          u.location.latitude,
                          u.location.longitude
                        );
                      }}
                    ></Button>
                    <Button
                      onlyIcon
                      icon="direction"
                      iconFamily="entypo"
                      iconSize={20}
                      color="tomato"
                      iconColor="#fff"
                      shadowless
                      style={{
                        width: 40,
                        height: 40,
                        marginRight: 5,
                        marginTop: 12,
                      }}
                      onPress={() => {
                        this.generateSpotDirections(u);
                      }}
                    ></Button>
                  </Block>
                </Block>
              );
            })}
        </ScrollView>
      </Block>
    );
  };

  renderNearbySpots = () => {
    return (
      <Block
        center
        style={{
          width: width * 0.8,
          backgroundColor: "#f7f7f7",
          borderRadius: 10,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.nearbySpots &&
            this.state.nearbySpots.map((spot, i) => {
              return (
                <Block left row key={i}>
                  <Block row left>
                    <ListItem
                      containerStyle={{
                        width: width * 0.5,
                        backgroundColor: "#f7f7f7",
                      }}
                      title={spot.name}
                    />
                  </Block>

                  <Block row>
                    <Button
                      onlyIcon
                      icon="car"
                      iconFamily="antdesign"
                      iconSize={20}
                      color="#3BBDE3"
                      iconColor="#fff"
                      shadowless
                      style={{
                        width: 40,
                        height: 40,
                        marginRight: 5,
                        marginTop: 12,
                      }}
                      onPress={() => {
                        this.startTour(
                          spot.location.latitude,
                          spot.location.longitude
                        );
                      }}
                    ></Button>
                    <Button
                      onlyIcon
                      icon="direction"
                      iconFamily="entypo"
                      iconSize={20}
                      color="tomato"
                      iconColor="#fff"
                      shadowless
                      style={{
                        width: 40,
                        height: 40,
                        marginRight: 5,
                        marginTop: 12,
                      }}
                      onPress={() => {
                        this.generateSpotDirections(spot);
                      }}
                    ></Button>
                  </Block>
                </Block>
              );
            })}
        </ScrollView>
      </Block>
    );
  };

  calDistance = (lat1, lon1, lat2, lon2, unit) => {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      } //Kilometer
      if (unit == "M") {
        dist = dist * 0.8684;
      } //Miles
      return dist;
    }
  };

  getMembersLoc = () => {
    const members = this.state.members;
    //   console.log("MEBERS>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",members)
    const userMarkers = [];
    const membersData = [];
    if (typeof members != "undefined") {
      members.forEach((user, index) => {
        if (user.userId != this.userId) {
          this.firestoreUserRef.doc(user.userId).onSnapshot((doc) => {
            let docData = doc.data();
            docData.avatar = user.avatar;
            membersData.push(docData);
            if (docData.location) {
              //   console.log(docData.location);

              let latitude = docData.location.latitude;
              let longitude = docData.location.longitude;
              let userName = docData.username;
              let lastSeen = docData.location.lastSeen;

              userMarkers.push(
                <Marker
                  key={index}
                  coordinate={{
                    latitude: latitude,
                    longitude: longitude,
                  }}
                  image={require("../assets/imgs/profilePic.png")}
                >
                  {/* <Image
                    source={require("../assets/imgs/profilePic.png")}
                    style={{ height: 30, width: 30, borderRadius: 15 }}
                  /> */}

                  <Callout style={{ width: 100 }}>
                    <Text>{userName}</Text>
                    <Text>Last Seen: {lastSeen}</Text>
                    {/* <Text>Open: {marker.opening_hours.open_now ? "YES" : "NO"}</Text> */}
                  </Callout>
                </Marker>
              );

              // console.log(userMarkers);
              this.setState({
                membersMarkers: userMarkers,
                membersData: membersData,
              });
            }
          });
        }
      });
    }
  };

  getMyDirections = async (startLoc, destinationLoc) => {
    try {
      console.log(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${key}`
      );
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${key}`
      );
      let respJson = await resp.json();
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });
      this.setState({ directionCoords: coords });
      return coords;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  getSpotDirections = async (startLoc, destinationLoc) => {
    try {
      console.log(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${key}`
      );
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${key}`
      );
      let respJson = await resp.json();
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });
      this.setState({ spotCoords: coords });
      return coords;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  startTour = (latitude, longitude) => {
    const data = {
      source: {
        latitude: this.state.currentLoc.coordinates.lat,
        longitude: this.state.currentLoc.coordinates.lng,
      },
      destination: {
        latitude: latitude,
        longitude: longitude,
      },
      params: [
        {
          key: "travelmode",
          value: "driving", // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: "dir_action",
          value: "navigate", // this instantly initializes navigation using the given travel mode
        },
      ],
      //   waypss
    };
    getDirections(data);
  };

  ///GETTING TIME FROM TIMESTAMP

  pad = (num) => {
    return ("0" + num).slice(-2);
  };
  getTimeFromDate = (timestamp) => {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    // return this.pad(hours)+":"+this.pad(minutes)+":"+this.pad(seconds)
    return this.pad(hours) + ":" + this.pad(minutes);
  };

  UNSAFE_componentWillMount = () => {
    console.log(this.state.planId);

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
    this.getCurrentLocationAsync(() => {
      this.mergeLoc(() => {
        // console.log("fjbfjkasbfkjbfjkabf"+this.state.startPostion)
        this.getMyDirections(this.state.startPostion, this.state.endPosition);
        // console.log(this.state.directionCoords);
        this.generateSpotMarkers();
      });
    });
    this.getMembersLoc();
    console.log(this.state.members);
  };

  getCurrentLocationAsync = async (callback) => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied",
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    let time = this.getTimeFromDate(location.timestamp);
    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    let currentLoc = {
      coordinates: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
    };

    this.currentUserRef
      .set(
        {
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            lastSeen: time,
          },
        },
        { merge: true }
      )
      .then(() => {
        console.log("updated location!");
      });

    this.setState({ currentLoc: currentLoc, location: region }, () => {
      callback();
    });
  };

  endTour = async () => {
    const selection = await new Promise((resolve) => {
      const title = "End Tour";
      const message = "Are you sure?";
      const buttons = [
        { text: "End", onPress: () => resolve("end") },
        { text: "Cancel", onPress: () => resolve(null) },
      ];
      Alert.alert(title, message, buttons);
    });
    if (selection == "end") {
      firebase
        .firestore()
        .collection("plans")
        .doc(this.userId)
        .collection("userPlans")
        .doc(this.state.planId)
        .set(
          {
            status: "ended",
          },
          { merge: true }
        )
        .then(async () => {
          const selection2 = await new Promise((resolve) => {
            const title2 = "Feedback";
            const message2 = "Did you liked the place?";
            const buttons2 = [
              { text: "Yes", onPress: () => resolve("liked") },
              { text: "No", onPress: () => resolve(null) },
            ];
            Alert.alert(title2, message2, buttons2);
          });

          if (selection2 == "liked") {
            this.onLike();
          } else {
            this.onDislike();
          }
        })
        .catch((err) => alert(err));
    } else {
      return;
    }
  };

  onLike = async () => {
    let likes = [];

    this.setState({ liked: true });
    await firebase
      .firestore()
      .collection("placesForFiltering")
      .doc(this.state.destinationId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          likes = doc.data().likes;
        }
      })
      .then(async () => {
        likes.push(this.user.uid);
        await firebase
          .firestore()
          .collection("placesForFiltering")
          .doc(this.state.destinationId)
          .set(
            {
              place: this.state.place,
              likes: likes,
            },
            { merge: true }
          )
          .then(() => {
            alert("Hope you enjoyed our services!");
            this.props.navigation.popToTop();
          })
          .catch((err) => {
            alert(err);

            this.setState({ liked: false });
          });
      })
      .catch((err) => alert(err));
  };

  onDislike = async () => {
    this.setState({ liked: false });
    let likes = [];
    await firebase
      .firestore()
      .collection("placesForFiltering")
      .doc(this.state.destinationId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          likes = doc.data().likes;
        }
      })
      .then(async () => {
        var index = likes.indexOf(this.user.uid);

        if (index > -1) {
          likes.splice(index, 1);
        }
        await firebase
          .firestore()
          .collection("placesForFiltering")
          .doc(this.state.place_id)
          .set(
            {
              likes: likes,
            },
            { merge: true }
          )
          .then(() => {
            // alert("Hope you enjoyed our services!");
            this.props.navigation.popToTop();
          })
          .catch((err) => {
            alert(err);

            this.setState({ liked: true });
          });
      })
      .catch((err) => alert(err));
  };

  componentDidMount = () => {
    // this.mergeLoc();
    // this.getCurrentLocationAsync();
    // if(this.state.startPostion!=null&&this.state.endPostion!=null){
    //     this.getMyDirections(this.state.startPostion, this.state.endPosition);
    //     console.log(this.state.directionCoords);
    // }
    this.getNearestSpots();
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        <Block flex={4} shadow center style={{ paddingTop: 5 }}>
          <MapView
            showsUserLocation
            provider={"google"}
            style={styles.mapStyle}
            region={this.state.location}
            followsUserLocation={true}
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
            {this.state.spotMarkers}
            <Marker
              coordinate={{
                latitude: this.state.destination.latitude,
                longitude: this.state.destination.longitude,
              }}
            >
              <Callout>
                <View style={{ borderRadius: 5 }}>
                  <Text>{this.state.destinationName}</Text>
                </View>
              </Callout>
            </Marker>
            <MapView.Polyline
              coordinates={this.state.directionCoords}
              strokeWidth={2}
              strokeColor="red"
            />

            {this.state.spotCoords.length > 0 && (
              <MapView.Polyline
                coordinates={this.state.spotCoords}
                strokeWidth={2}
                strokeColor="red"
              />
            )}
            {/* {this.state.followingUserMarkers} */}
          </MapView>
        </Block>
        <Block flex={6} center>
          {this.state.nearbySpots.length > 0 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Block>
                <Block flex={1}>
                  <Block flex={1} style={{ marginBottom: 2 }}>
                    <Text h5>Members: </Text>
                  </Block>

                  <Block flex={7}>{this.renderMembersList()}</Block>
                </Block>
                <Block flex={1}>
                  <Block flex={1} style={{ marginTop: 5, marginBottom: 2 }}>
                    <Text h5>Nearby Spots: </Text>
                  </Block>

                  <Block flex={4}>{this.renderNearbySpots()}</Block>
                </Block>
              </Block>
            </ScrollView>
          )}
          {!this.state.nearbySpots.length > 0 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Block>
                <Block flex={1}>
                  <Block flex={1} style={{ marginTop: 10, marginBottom: 2 }}>
                    <Text h5>Members: </Text>
                  </Block>

                  <Block flex={8}>{this.renderMembersList()}</Block>
                </Block>
              </Block>
            </ScrollView>
          )}

          <Block row style={{ margin: 10 }}>
            <Button
              style={{ width: width * 0.3 }}
              round
              size="small"
              color="#3BBDE3"
              shadowless
              onPress={() => {
                this.props.navigation.navigate("PlanChat", {
                  planId: this.state.planId,
                  members: this.state.members,
                });
              }}
            >
              Chat
            </Button>

            <Button
              round
              style={{ marginLeft: 10, width: width * 0.3 }}
              size="small"
              color="#3BBDE3"
              shadowless
              onPress={() =>
                this.startTour(
                  this.state.destination.latitude,
                  this.state.destination.longitude
                )
              }
            >
              Navigate
            </Button>
            {this.state.creatorId == this.userId && (
              <Button
                round
                style={{ marginLeft: 10, width: width * 0.3 }}
                size="small"
                color="tomato"
                shadowless
                onPress={this.endTour}
              >
                End
              </Button>
            )}
          </Block>
        </Block>
      </Block>
    );
  }
}
export default StartTour;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    justifyContent: "center",
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
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.3,
  },
});
