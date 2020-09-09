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

class EditPlan extends Component {
  user = firebase.auth().currentUser;
  firestorePlansRef = firebase
    .firestore()
    .collection("plans")
    .doc(this.user.uid)
    .collection("userPlans")
    .doc(this.props.navigation.getParam("plan").id);

  state = {
    destination: this.props.navigation.getParam("plan").location,
    destination_id: this.props.navigation.getParam("plan").destination_id,
    placeType: "tourist_attraction",
    places: [],
    spots: this.props.navigation.getParam("plan").spots,
    members: this.props.navigation.getParam("plan").members,
    todos: this.props.navigation.getParam("plan").todos,
    planId: this.props.navigation.getParam("plan").id,
    startDate: this.props.navigation.getParam("plan").startDate,
    endDate: this.props.navigation.getParam("plan").endDate,
    dateCreated: this.props.navigation.getParam("plan").dateCreated,
    destinationName: this.props.navigation.getParam("plan").destination,
    name: this.props.navigation.getParam("plan").creatorName,
    currentDate: "",
    daysBefore: "",
    days:
      (new Date(this.props.navigation.getParam("plan").endDate) -
        new Date(this.props.navigation.getParam("plan").startDate)) /
      86400000,
    profilePic: Images.ProfilePicture,
    plan: this.props.navigation.getParam("plan"),
    images: this.props.navigation.getParam("plan").photos,
  };

  savePlan = () => {
    // console.log(this.state.spots);
    this.firestorePlansRef
      .update({
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
      })
      .then((docRef) => {
        let members = this.state.members;
        members = members.filter((member) => member.planRequest == false); // those where req not sent yet new or modified
        members.forEach((member) => {
          firebase
            .firestore()
            .collection("users")
            .doc(member.userId)
            .collection("planRequests")
            .doc(docRef.id)
            .set({
              accepted: false,
            })
            .then(() => {
              this.sendPushNotification(
                "Plan Request",
                member.name + "requested you to join their tour!",
                member.push_token
              );
            });
        });

        //   this.props.navigation.navigate("MyPlans");
        alert("Planned Saved");
      })
      .catch((err) => {
        alert(err);
      });
  };

  sendPushNotification = async (title, body, push_token) => {
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
    });
  };

  removePlan = () => {
    this.firestorePlansRef
      .delete()
      .then(() => {
        alert("Plan Removed!");
        this.props.navigation.goBack();
      })
      .catch((err) => {
        alert(err);
      });
  };

  getPlaces = () => {
    const { location, placeType } = this.state;
    const lat = location.latitude;
    const long = location.longitude;
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
        // console.log(this.state.places);
        // console.log(markers);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  updateMembers = (members) => {
    this.setState({ members: members });
    console.log(this.state.members);
  };

  updateTodos = (todos) => {
    this.setState({ todos: todos });
    console.log(this.state.todos);
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
    // console.log(this.state.spots);
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
    // console.log(this.state.spots);

    const placeIndex = this.state.places.findIndex(
      (item) => item.place_id == place_id
    );

    let placesCopy = this.state.places;
    placesCopy[placeIndex].added = false;
    this.setState({
      places: placesCopy,
    });
  };

  getProfilePic = () => {
    const creatorId = this.props.navigation.getParam("plan").creatorId;
    const firebaseProfilePic = firebase
      .storage()
      .ref()
      .child("profilePics/(" + creatorId + ")ProfilePic");
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

  componentWillMount = () => {};

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
            {/* <Image source={{ uri: this.state.images[0] }} /> */}
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
              <Text h6>{this.state.plan.destination}</Text>
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
                    <Text h5>{this.state.plan.creatorName}</Text>
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
                    <Text h7>{this.state.plan.startDate}</Text>
                  </Block>
                  <Block center flex={1}>
                    <Text h7> </Text>
                    <Text h7> --- </Text>
                  </Block>
                  <Block right flex={1}>
                    <Text h7>To</Text>
                    <Text h7>{this.state.plan.endDate}</Text>
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
                    Edit Members
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
                    Edit Todos
                  </Button>
                </Block>

                <Block flex={2}>
                  <Button
                    style={{ marginTop: 10 }}
                    round
                    size="small"
                    color="tomato"
                    shadowless
                    onPress={() => {
                      this.firestorePlansRef
                        .set({ status: "ongoing" }, { merge: true })
                        .then(() => {
                          this.props.navigation.navigate("StartTour", {
                            destination: this.state.destination,
                            members: this.state.members,
                            destinationName: this.state.destinationName,
                            spots: this.state.spots,
                            planId: this.state.planId,
                          });
                        });
                    }}
                  >
                    Start Tour
                  </Button>
                </Block>
              </Block>
              {/* 2 free */}
              <Block flex={1}>
                <Text h4>Spots</Text>
              </Block>
              <Block flex={7}>
                <View style={{ height: 140, marginTop: 5 }}>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  >
                    {this.state.plan.spots != null &&
                      this.state.plan.spots.map((place, i) => {
                        console.log("GOT ITdjdbjkasbjsabj..", place);
                        return (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              // console.log(place.place_id);
                              this.props.navigation.navigate("EditSpot", {
                                spot_id: place.place_id,
                                photos: place.photos,
                                spotStartDateTime: place.startDateTime,
                                spotEndDateTime: place.endDateTime,
                                added: true,
                                location: place.location,
                                name: place.name,
                                destination_id: this.state.destination_id,
                                addSpot: this.addSpot.bind(this),
                                removeSpot: this.removeSpot.bind(this),
                                startDate: this.state.startDate,
                                endDate: this.state.endDate,
                              });
                            }}
                          >
                            <Category
                              imageUri={
                                place.photos == ""
                                  ? "https://media-exp1.licdn.com/dms/image/C560BAQHMnA03XDdf3w/company-logo_200_200/0?e=2159024400&v=beta&t=C7KMOtnrJwGrMXmgIk2u1B8a7VRfgxMwXng9cdP9kZk"
                                  : place.photos[0]
                              }
                              name={place.name}
                              // friend={false}
                            />
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                  {/* <TouchableOpacity style={{height: 50, width:50, backgroundColor:'tomato'}}>

                                </TouchableOpacity> */}
                </View>

                <Block center flex={2} row>
                  <Button
                    style={{
                      marginTop: 10,
                      height: 40,
                      width: 140,
                      marginRight: 10,
                    }}
                    round
                    color="#ff6347"
                    shadowless
                    onPress={this.savePlan}
                  >
                    Save
                  </Button>
                  <Button
                    style={{ marginTop: 10, height: 40, width: 140 }}
                    round
                    color="#ff6347"
                    shadowless
                    onPress={this.removePlan}
                  >
                    Remove
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
export default EditPlan;

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
