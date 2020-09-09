import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import StarRating from "react-native-star-rating";
import { Images, argonTheme } from "../constants";
import DatePicker from "react-native-datepicker";
import { Card, ListItem } from "react-native-elements";
import { SliderBox } from "react-native-image-slider-box";
import Category from "../components/Category";
import MapView, { Marker, Callout } from "react-native-maps";
import { key } from "../googleAPIKey";
import * as firebase from "firebase";

import { Button, Block, Text, theme } from "galio-framework";

import { Icon, Input } from "../components";

const { width } = Dimensions.get("screen");

class CreatePlan extends Component {
  user = firebase.auth().currentUser;
  firestorePlansRef = firebase
    .firestore()
    .collection("plans")
    .doc(this.user.uid)
    .collection("userPlans");

  state = {
    destination: this.props.navigation.getParam("location"),
    destination_id: this.props.navigation.getParam("place_id"),
    placeType: "tourist_attraction",
    places: [],
    spots: [],
    members: [],
    todos: [],

    destinationTypes: this.props.navigation.getParam("types"),
    startDate: this.props.navigation.getParam("startDate"),
    endDate: this.props.navigation.getParam("endDate"),
    dateCreated: this.props.navigation.getParam("dateCreated"),
    destinationName: this.props.navigation.getParam("name"),
    name: "",
    currentDate: "",
    days: 0,
    profilePic: Images.ProfilePicture,
    images: this.props.navigation.getParam("images"),
  };

  savePlan = () => {
    // console.log(this.state.spots);
    this.firestorePlansRef
      .add({
        creatorId: this.user.uid,
        creatorName: this.state.name,
        members: this.state.members,
        todos: this.state.todos,
        spots: this.state.spots,
        destination: this.state.destinationName,
        destination_id: this.state.destination_id,
        location: this.state.destination,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        dateCreated: this.state.dateCreated,
        photos: this.state.images,
        destinationTypes: this.state.destinationTypes,
        status: "ready",
      })
      .then((docRef) => {
        let members = this.state.members;

        members.forEach((member) => {
          // firebase
          //   .firestore()
          //   .collection("users")
          //   .doc(member.userId)
          //   .collection("planRequests")
          //   .doc(docRef.id)
          //   .set({
          //     accepted: false,
          //   })
          //   .then(() => {

          if (member.userId != this.user.uid) {
            this.sendPushNotification(
              "Plan Request",
              this.state.name + " requested you to join their tour!",
              member.push_token,
              member.userId,
              docRef.id
            );
          } // });
        });

        this.props.navigation.navigate("Explore");
        alert("Planned Saved");
      })
      .catch((err) => {
        alert(err);
      });
  };

  sendPushNotification = async (title, body, push_token, userId, planId) => {
    const message = {
      to: push_token,
      sound: "default",
      title: title,
      body: body,
      data: { title: title, body: body },
      ios: { _displayInForeground: true },
      _displayInForeground: true,
    };
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }).then(() => {
      firebase
        .firestore()
        .collection("notifications")
        .doc(userId)
        .collection("userNotifications")
        .add({
          content: body,
          time: new Date(),
          type: "planRequest",
          creatorId: this.user.uid,
          planId: planId,
        })
        .then(() => {
          console.log("Notification Sent!");
        })
        .catch((err) => alert(err));
    });
  };

  getPlacesUrl = (lat, long, radius, type) => {
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
    const location = `location=${lat},${long}&radius=${radius}`;
    const typeData = `&types=${type}`;

    const api = `&key=${key}`;
    return `${baseUrl}${location}${typeData}${api}`;
  };

  getPlaces = () => {
    const { destination, placeType } = this.state;
    const lat = destination.latitude;
    const long = destination.longitude;
    const markers = [];
    const url = this.getPlacesUrl(lat, long, 15000, placeType);
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        res.results.map((element, index) => {
          const marketObj = {};
          let photoUrl = "";
          if (element.photos) {
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${element.photos[0].photo_reference}&sensor=false&maxheight=${element.photos[0].height}&maxwidth=${element.photos[0].width}&key=${key}`;
          }
          marketObj.id = element.id;
          marketObj.place_id = element.place_id;
          marketObj.name = element.name;
          marketObj.photo = photoUrl;
          marketObj.rating = element.rating;
          marketObj.vicinity = element.vicinity;
          marketObj.marker = {
            latitude: element.geometry.location.lat,
            longitude: element.geometry.location.lng,
          };
          marketObj.added = false;

          markers.push(marketObj);
        });
        //update our places array
        this.setState({ places: markers });
        console.log(this.state.places);
        // console.log(markers);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  updateMembers = (members) => {
    this.setState({ members: members });
  };

  updateTodos = (todos) => {
    this.setState({ todos: todos });
  };

  addSpot = (place_id, name, location, startDateTime, endDateTime, images) => {
    let spot = {
      place_id: place_id,
      name: name,
      location: location,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      photos: images,
    };
    let allSpots = this.state.spots;
    allSpots.push(spot);

    this.setState({ spots: allSpots });

    const placeIndex = this.state.places.findIndex(
      (item) => item.place_id === place_id
    );
    // console.log(item);

    let placesCopy = this.state.places;
    placesCopy[placeIndex].added = true;
    this.setState({
      places: placesCopy,
    });

    console.log(this.state.spots);
  };

  removeSpot = (place_id) => {
    const spotIndex = this.state.spots.findIndex(
      (item) => item.place_id == place_id
    );

    let spotsCopy = this.state.spots;

    // Splice used so that content remains intent
    if (spotIndex > -1) {
      spotsCopy.splice(spotIndex, 1);
    }
    this.setState({
      spots: spotsCopy,
    });
    console.log(this.state.spots);

    const placeIndex = this.state.places.findIndex(
      (item) => item.place_id == place_id
    );

    let placesCopy = this.state.places;
    placesCopy[placeIndex].added = false;
    this.setState({
      places: placesCopy,
    });
  };

  getCurrentDate = () => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    this.setState({ currentDate: year + "-" + month + "-" + date });
  };

  getProfilePic = () => {
    const firebaseProfilePic = firebase
      .storage()
      .ref()
      .child("profilePics/(" + this.user.uid + ")ProfilePic");
    firebaseProfilePic
      .getDownloadURL()
      .then((url) => {
        this.setState({ profilePic: url });
      })
      .catch((error) => {
        // Handle any errors
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            this.setState({ profilePic: Images.ProfilePicture });
            break;
        }

        alert(error);
      });
  };

  getCreatorName = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .get()
      .then((doc) => {
        this.setState({ name: doc.data().username });
      });
  };

  UNSAFE_componentWillMount = () => {
    this.getCreatorName();
    this.getCurrentDate();
    this.getProfilePic();
    this.getPlaces();
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        <Block flex style={styles.container}>
          <Block shadow flex={6} center style={{ width: width * 0.9 }}>
            <SliderBox
              images={this.state.images}
              sliderBoxHeight={200}
              onCurrentImagePressed={(index) =>
                console.warn(`image ${index} pressed`)
              }
              // autoplay
              // circleLoop
            />
          </Block>
          <Block
            row
            left
            shadow
            flex={1}
            style={{ paddingTop: 10, paddingLeft: 5 }}
          >
            <Block row left flex={2}>
              <Icon
                size={15}
                color={argonTheme.COLORS.ICON}
                name="calendar"
                family="AntDesign"
                style={{ marginRight: 10 }}
              />
              <Text h6>{this.state.days} Days</Text>
            </Block>
            <Block row right flex={1}>
              <Icon
                size={15}
                color={argonTheme.COLORS.ICON}
                name="location"
                family="EvilIcons"
                style={{ marginRight: 5 }}
              />
              <Text h6>{this.state.destinationName}</Text>
            </Block>
          </Block>
          <Block
            shadow
            flex={16}
            style={{
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
              marginBottom: 2,
              width: width * 0.9,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Block flex={2} row style={{ padding: 6 }}>
                <Block left shadow row flex={4} style={styles.avatarContainer}>
                  <TouchableOpacity>
                    <Image
                      source={{ uri: this.state.profilePic }}
                      style={styles.avatar}
                      onLong
                    />
                  </TouchableOpacity>
                  <Block style={{ paddingLeft: 8 }}>
                    <Text h5>{this.state.name}</Text>
                    <Text h6>0 Days before</Text>
                  </Block>
                </Block>
                <Block right flex={2}>
                  <Icon
                    size={30}
                    color={argonTheme.COLORS.ICON}
                    name="bookmark"
                    family="Entypo"
                    style={{ marginRight: 10, paddingTop: 1 }}
                  />
                </Block>
              </Block>
              <Block
                shadow
                center
                flex={6}
                style={{
                  marginTop: 2,
                  borderRadius: 8,
                  backgroundColor: "white",
                  paddingBottom: 15,
                  width: width * 0.8,
                }}
              >
                <Block
                  shadow
                  flex={1}
                  row
                  style={{
                    padding: 5,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 15,
                    marginBottom: 5,
                    marginTop: 5,
                    width: width * 0.7,
                  }}
                >
                  <Block left flex={1}>
                    <Text h7>From</Text>
                    <Text h7>{this.state.startDate}</Text>
                  </Block>
                  <Block center flex={1}>
                    <Text h7> </Text>
                    <Text h7> --- </Text>
                  </Block>
                  <Block right flex={1}>
                    <Text h7>To</Text>
                    <Text h7>{this.state.endDate}</Text>
                  </Block>
                </Block>

                <Block flex={2}>
                  <Button
                    style={{ marginTop: 10 }}
                    round
                    size="small"
                    color="#3BBDE3"
                    shadowless
                    onPress={() => {
                      this.props.navigation.navigate("EditMembers", {
                        members: this.state.members,
                        updateMembers: this.updateMembers.bind(this),
                      });
                    }}
                  >
                    Members
                  </Button>
                </Block>
                <Block flex={2}>
                  <Button
                    style={{ marginTop: 10 }}
                    round
                    size="small"
                    color="#3BBDE3"
                    shadowless
                    onPress={() => {
                      this.props.navigation.navigate("EditTodos", {
                        todos: this.state.todos,
                        updateTodos: this.updateTodos.bind(this),
                      });
                    }}
                  >
                    Todos
                  </Button>
                </Block>
              </Block>
              {/* 2 free */}
              <Block flex={1}>
                <Text h4>Select Spots to visit:</Text>
              </Block>
              <Block flex={7}>
                <View style={{ height: 140, marginTop: 5 }}>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  >
                    {this.state.places != null &&
                      this.state.places.map((place, i) => {
                        // console.log("GOT ITdjdbjkasbjsabj..",place);
                        return (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              // console.log(place.place_id);
                              this.props.navigation.navigate("SpotDetail", {
                                spot_id: place.place_id,
                                added: place.added,
                                destination_id: this.state.destination,
                                addSpot: this.addSpot.bind(this),
                                removeSpot: this.removeSpot.bind(this),
                                startDate: this.state.startDate,
                                endDate: this.state.endDate,
                              });
                            }}
                          >
                            <Category
                              imageUri={
                                place.photo == ""
                                  ? "https://media-exp1.licdn.com/dms/image/C560BAQHMnA03XDdf3w/company-logo_200_200/0?e=2159024400&v=beta&t=C7KMOtnrJwGrMXmgIk2u1B8a7VRfgxMwXng9cdP9kZk"
                                  : place.photo
                              }
                              name={place.name}
                              // friend={false}
                            />
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </View>

                <Block center flex={2}>
                  <Button
                    style={{ marginTop: 10 }}
                    round
                    size="large"
                    color="#ff6347"
                    shadowless
                    onPress={this.savePlan}
                  >
                    Save Plan
                  </Button>
                </Block>
              </Block>
            </ScrollView>
          </Block>
        </Block>
      </Block>
    );
  }
}
export default CreatePlan;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0,
  },
  avatarContainer: {
    position: "relative",
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
    height: Dimensions.get("window").height / 3.5,
  },
});
