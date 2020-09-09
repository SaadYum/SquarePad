import React, { Component } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "../components/Icon";
import Category from "../components/Category";
import PlaceCard from "../components/PlaceCard";
import { Block, theme, Text, Input } from "galio-framework";
import { argonTheme } from "../constants";

import * as firebase from "firebase";

import { key } from "../googleAPIKey";

import * as Permissions from "expo-permissions";
import * as Location from "expo-location";

import { Images } from "../constants";
import { FlatList } from "react-native-gesture-handler";
import { GoogleAutoComplete } from "react-native-google-autocomplete";
import LocationItem from "../components/LocationItem";

const { height, width } = Dimensions.get("window");
class Explore extends Component {
  user = firebase.auth().currentUser;
  firestoreUsersRef = firebase.firestore().collection("users");
  firestoreUserRecommendationsRef = firebase
    .firestore()
    .collection("userRecommendations");
  firestorePostRef = firebase.firestore().collection("posts");
  firestoreFollowingRef = firebase
    .firestore()
    .collection("following")
    .doc(this.user.uid)
    .collection("userFollowing");

  firestorePlacesRecommendationsRef = firebase
    .firestore()
    .collection("placesRecommendations")
    .doc(this.user.uid)
    .collection("recommendedPlaces")
    .doc(this.user.uid);
  storageRef = firebase.storage().ref();

  state = {
    places: [],
    refreshing: false,
    currentLocation: {},
    placeType: "tourist_attraction",
    currentUserInterests: [],
    suggestedUsers: [],
    recommendedPlaces: [],
    placesTab: true,
    placesAroundTab: true,
    recommendedPlacesTab: false,
    searchingTab: false,
    foundPlace: {},
    placeSelected: false,
    followedUsers: [],
    profilePic: Images.ProfilePicture,
    searchResults: [],
    foundUser: "",
    found: false,
    searchWordUser: "",
  };

  UNSAFE_componentWillMount() {
    this.startHeaderHeight = 80;
    if (Platform.OS == "android") {
      this.startHeaderHeight = 100 + StatusBar.currentHeight;
    }

    // this.findNewCoordinates(33.63441952400522, 72.98635723489069);
    this.getFollowedUsers().then(() => {
      this.getCurrentLocation().then(() => {
        this.getPlaces();
        this.getRecommendedPlaces();
      });
      this.getSuggestedFriends();
    });
  }

  componentDidMount = () => {
    this.getLocationAsync();
  };

  // Get all the users the current user is following
  getFollowedUsers = async () => {
    let users = [];
    await this.firestoreFollowingRef.get().then((querySnapshot) => {
      querySnapshot.forEach((docSnap) => {
        users.push(docSnap.id);
      });
      // this.setState({followedUsers: users});
    });
    this.setState({ followedUsers: users });
    // console.log(this.state.followedUsers);
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

  //--------------------------------------------------//

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      alert("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({});
    let time = this.getTimeFromDate(location.timestamp);
    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
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
  };

  searchUser(word) {
    let userCollectionRef = firebase.firestore().collection("users");

    let users = [];
    userCollectionRef
      .where("username", "==", word)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          if (documentSnapshot.id != this.user.uid) {
            users.push(documentSnapshot.data());
            //   console.log(documentSnapshot.id);
            this.setState({ foundUser: documentSnapshot.id, found: true });
          }
          // console.log(this.state.foundUser)
          // console.log(users);
        });
        console.log(this.state.searchResults);
        console.log(this.state.foundUser);

        if (users.length == 0) {
          this.setState({
            profilePic: Images.ProfilePicture,
            searchResults: [],
            foundUser: "",
            found: false,
          });
        } else {
          let profilePic = this.storageRef.child(
            "profilePics/(" + this.state.foundUser + ")ProfilePic"
          );
          profilePic.getDownloadURL().then((url) => {
            this.setState({ profilePic: url });
          });
          this.setState({ searchResults: users });
          console.log(this.state.searchResults);
        }
      });
  }

  renderAvatar = () => {
    const { avatar, item } = this.props;
    // if (!item.avatar) return null;
    return (
      <Image source={{ uri: this.state.profilePic }} style={styles.avatar} />
    );
  };

  renderUserItem = () => {
    const { navigation } = this.props;
    if (this.state.found) {
      return (
        <Block
          row
          style={{
            flex: 1,
            paddingLeft: 6,
            marginHorizontal: 16,
            paddingBottom: 12,
            paddingTop: 12,
          }}
        >
          <Block>
            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate("userProfile", {
                  userId: this.state.foundUser,
                })
              }
            >
              {this.renderAvatar()}
            </TouchableWithoutFeedback>
          </Block>
          <Block>
            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate("userProfile", {
                  userId: this.state.foundUser,
                })
              }
            >
              <Text size={16} style={styles.cardUser}>
                {this.state.searchWordUser}
              </Text>
            </TouchableWithoutFeedback>
          </Block>
        </Block>
      );
    }
  };

  textInput = (word) => {
    this.setState({ searchWordUser: word });
    this.searchUser(word);
  };
  renderSearchBar = () => {
    const { navigation } = this.props;
    return (
      <Input
        right
        color="black"
        style={styles.search}
        placeholder="Search"
        placeholderTextColor={"#8898AA"}
        // onFocus={() => navigation.navigate('Pro')}
        onChangeText={(word) => this.textInput(word)}
        value={this.state.searchWordUser}
        iconContent={
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="search"
            family="EvilIcons"
          />
        }
      />
    );
  };

  findNewCoordinates = (lat, lng) => {
    let r_earth = 6371;

    // East 50km
    let lat1 = lat + (50 / r_earth) * (180 / Math.PI);
    let lng1 =
      lng + ((0 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
    let p1 = { lat1, lng1 };

    // West 50km
    let lat2 = lat + (0 / r_earth) * (180 / Math.PI);
    let lng2 =
      lng +
      ((50 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
    let p2 = { lat2, lng2 };

    // North 50km
    let lat3 = lat + (-50 / r_earth) * (180 / Math.PI);
    let lng3 =
      lng + ((0 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
    let p3 = { lat3, lng3 };

    // South 50km
    let lat4 = lat + (0 / r_earth) * (180 / Math.PI);
    let lng4 =
      lng +
      ((-50 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
    let p4 = { lat4, lng4 };

    console.log(p1, p2, p3, p4);
  };

  getCurrentLocation = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied",
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    let currentLocation = {
      lat: location.coords.latitude,
      long: location.coords.longitude,
    };

    this.setState({ currentLocation: currentLocation });
    // console.log(this.state.currentLocation);
  };

  getPlacesUrl = (lat, long, radius, type) => {
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
    const location = `location=${lat},${long}&radius=${radius}`;
    const typeData = `&keyword=${type}`;

    const api = `&key=${key}`;
    console.log(`${baseUrl}${location}${typeData}${api}`);
    return `${baseUrl}${location}${typeData}${api}`;
  };

  getRecommendedPlaces = () => {
    // const {currentLocation, placeType } = this.state;
    // const lat = currentLocation.lat;
    // const long = currentLocation.long;
    const markers = [];
    // const url = this.getPlacesUrl(lat, long, 50000, placeType);
    // console.log(url);
    firebase
      .firestore()
      .collection("userSuggestedPlaces")
      .doc(this.user.uid)
      .onSnapshot((res) => {
        if (res.exists) {
          // console.log("Places COUNT: ", res.data().places.length);
          res.data().places.map((element, index) => {
            const marketObj = {};
            marketObj.id = element.id;
            marketObj.place_id = element.place_id;
            marketObj.name = element.name;
            marketObj.photos = element.photos;
            marketObj.rating = element.rating;
            marketObj.vicinity = element.vicinity;
            marketObj.type = element.types;
            marketObj.marker = {
              latitude: element.marker.latitude,
              longitude: element.marker.longitude,
            };

            markers.push(marketObj);
          });
          //update our places array
          this.setState(
            { recommendedPlaces: markers, refreshing: false },
            () => {
              console.log(this.state.recommendedPlaces.length);
            }
          );
          // console.log(this.state.places);
        }
      });
  };
  getPlaces = () => {
    // const {currentLocation, placeType } = this.state;
    // const lat = currentLocation.lat;
    // const long = currentLocation.long;
    const markers = [];
    // const url = this.getPlacesUrl(lat, long, 50000, placeType);
    // console.log(url);
    this.firestorePlacesRecommendationsRef.onSnapshot((res) => {
      if (res.exists) {
        console.log("Places COUNT: ", res.data().places.length);
        res.data().places.map((element, index) => {
          const marketObj = {};
          marketObj.id = element.id;
          marketObj.place_id = element.place_id;
          marketObj.name = element.name;
          marketObj.photos = element.photos;
          marketObj.rating = element.rating;
          marketObj.vicinity = element.vicinity;
          marketObj.type = element.types;
          marketObj.marker = {
            latitude: element.geometry.location.lat,
            longitude: element.geometry.location.lng,
          };

          markers.push(marketObj);
        });
        //update our places array
        this.setState({ places: markers, refreshing: false }, () => {
          console.log(this.state.places.length);
        });
        // console.log(this.state.places);
      }
    });
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.getRecommendedPlaces();
    this.getPlaces();
  };

  getMorePlaces = () => {};

  getUserInterests = (callback) => {
    let currentUserInterests = [];
    this.firestoreUsersRef
      .doc(this.user.uid)
      .get()
      .then((doc) => {
        doc.data().interests.forEach((interest) => {
          if (interest.selected) {
            currentUserInterests.push(interest.name);
          }
        });
        this.setState({ currentUserInterests: currentUserInterests }, () => {
          callback();
        });
        // console.log(this.state.currentUserInterests);
      });
  };

  updateLocation = (loc) => {
    this.setState({
      // foundPlace: loc,
      foundPlace: loc.place,
      placeSelected: true,
    });
    console.log(loc);
  };

  getProfilePic = (userId, callback) => {
    let profilePic = "";
    const firebaseProfilePic = firebase
      .storage()
      .ref()
      .child("profilePics/(" + userId + ")ProfilePic");
    firebaseProfilePic
      .getDownloadURL()
      .then((url) => {
        //   this.setState({profilePic: url});
        profilePic = url;
        callback(profilePic);
      })
      .catch((error) => {
        // Handle any errors
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            //   this.setState({profilePic: Images.ProfilePicture})
            profilePic = Images.ProfilePicture;
            callback(profilePic);
            break;
        }
        alert(error);
      });
    return profilePic;
  };

  getProfileInfo = (userId, callback) => {
    let profilePic = this.getProfilePic(userId, (profilePic) => {
      let username = "";
      let profileObj = {};
      this.firestoreUsersRef
        .doc(userId)
        .get()
        .then((doc) => {
          username = doc.data().username;
          profileObj = {
            userId: userId,
            username: username,
            profilePic: profilePic,
          };
          // console.log(profileObj);
          callback(profileObj);
        });

      // return profileObj;
    });
  };

  renderSearchPlacesTab = () => {
    return (
      <Block width={width * 0.8} style={{ marginBottom: 15 }}>
        <GoogleAutoComplete
          apiKey={key}
          debounce={500}
          minLength={2}
          radius="500"
          queryTypes={"(regions)"}
        >
          {({
            inputValue,
            handleTextChange,
            locationResults,
            fetchDetails,
            isSearching,
            clearSearch,
          }) => (
            <React.Fragment>
              {/* {console.log(locationResults)
                                        } */}
              <Input
                style={styles.location}
                placeholder="Search"
                // onChangeText={location => this.setState({ location })}
                onChangeText={handleTextChange}
                onFocus={() => {
                  this.setState({ foundPlace: {}, placeSelected: false });
                }}
                value={inputValue}
                iconContent={
                  <Icon
                    size={16}
                    color={argonTheme.COLORS.ICON}
                    name="location"
                    family="EvilIcons"
                    style={styles.inputIcons}
                  />
                }
              />

              {isSearching && <ActivityIndicator size="large" />}

              {!this.state.placeSelected && (
                <ScrollView style={{ maxHeight: 100 }}>
                  {locationResults.map((el, i) => (
                    <LocationItem
                      {...el}
                      updateLocation={this.updateLocation}
                      fetchDetails={fetchDetails}
                      clearSearch={clearSearch}
                      key={String(i)}
                    />
                  ))}
                </ScrollView>
              )}
            </React.Fragment>
          )}
        </GoogleAutoComplete>
        {this.state.placeSelected && (
          <Block
            style={{
              right: 20,
              marginTop: 5,
            }}
          >
            {/* <Text h4 style={{ paddingHorizontal: 20 }}>
              Results
            </Text> */}
            <PlaceCard width={width * 1.85} item={this.state.foundPlace} />

            <View style={{ marginTop: 5 }}></View>
          </Block>
        )}
      </Block>
    );
  };

  renderPlacesAround = () => {
    return (
      <Block>
        <Text h4 style={{ paddingHorizontal: 20 }}>
          Places around You
        </Text>
        {this.state.places.length == 0 && <ActivityIndicator size="large" />}
        {/* <View style={{ paddingHorizontal: 20, marginTop: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}> */}
        <FlatList
          style={{
            paddingHorizontal: 20,
            marginTop: 5,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
          contentContainerStyle="space-between"
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={this.getMorePlaces}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          data={this.state.places}
          renderItem={({ item }) => (
            <PlaceCard width={width * 1.85} item={item} />
          )}
          keyExtractor={(item) => item.id}
        />
        <View style={{ marginTop: 5 }}></View>
      </Block>
    );
  };

  renderRecommendedPlaces = () => {
    return (
      <Block>
        <Text h4 style={{ paddingHorizontal: 20 }}>
          Recommended
        </Text>
        {this.state.places.length == 0 && <ActivityIndicator size="large" />}
        {/* <View style={{ paddingHorizontal: 20, marginTop: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}> */}
        <FlatList
          style={{
            paddingHorizontal: 20,
            marginTop: 5,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
          contentContainerStyle="space-between"
          showsVerticalScrollIndicator={false}
          // onScrollEndDrag={this.getMorePlaces}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          data={this.state.recommendedPlaces}
          renderItem={({ item }) => (
            <PlaceCard width={width * 1.85} item={item} />
          )}
          keyExtractor={(item) => item.id}
        />
        <View style={{ marginTop: 5 }}></View>
      </Block>
    );
  };

  getSuggestedFriends = () => {
    // console.log(this.state.currentUserInterests)

    this.firestoreUserRecommendationsRef
      .doc(this.user.uid)
      .collection("recommendedUsers")
      .doc(this.user.uid)
      .onSnapshot((snap) => {
        if (snap.exists) {
          let suggestedUsers = [];
          console.log(snap.data().users);
          let users = snap.data().users;
          let followedUsers = this.state.followedUsers;
          // console.log(users);
          users.forEach((doc) => {
            let profileInfo = this.getProfileInfo(doc.id, (profileObj) => {
              let found = followedUsers.find(
                (userId) => userId === profileObj.userId
              );
              if (!found) {
                suggestedUsers.push(profileObj);
                console.log("SuggestedUsers: ", suggestedUsers);
                this.setState(
                  { suggestedUsers: suggestedUsers },
                  console.log(this.state.suggestedUsers)
                );
              }
            });
          });
        }
      });
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 5 }}>
        <Block row center>
          <TouchableOpacity
            style={{
              width: width * 0.5,
              alignItems: "center",
              height: 50,
              borderRightColor: "#f5f5f5",
              backgroundColor: this.state.placesTab ? "#f5f5f5" : "white",
              borderRightWidth: 2,
              //   backgroundColor: "grey",
            }}
            onPress={() => this.setState({ placesTab: true })}
          >
            <Text h5 style={{ paddingVertical: 15 }}>
              Places
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: width * 0.5,
              height: 50,
              alignItems: "center",
              backgroundColor: !this.state.placesTab ? "#f5f5f5" : "white",
            }}
            onPress={() => this.setState({ placesTab: false })}
          >
            <Text h5 style={{ paddingVertical: 15 }}>
              Users
            </Text>
          </TouchableOpacity>
        </Block>

        {/* <ScrollView style={{ flex: 1 }}> */}
        {/* <View style={{ height: this.startHeaderHeight, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#dddddd' }}>
                        <View style={{
                            flexDirection: 'row', padding: 10,
                            backgroundColor: 'white', marginHorizontal: 20,
                            shadowOffset: { width: 0, height: 0 },
                            shadowColor: 'black',
                            shadowOpacity: 0.2,
                            elevation: 1,
                            marginTop: Platform.OS == 'android' ? 30 : null
                        }}>
                            <Icon name="ios-search" size={20} style={{ marginRight: 10 }} />
                            <TextInput
                                underlineColorAndroid="transparent"
                                placeholder="Try New Delhi"
                                placeholderTextColor="grey"
                                style={{ flex: 1, fontWeight: '700', backgroundColor: 'white' }}
                            />
                        </View>
                    </View> */}
        {!this.state.placesTab && (
          <Block style={{ marginTop: 10 }}>
            <Block>
              <Block>{this.renderSearchBar()}</Block>
              <ScrollView
                showsVerticalScrollIndicator={false}
                // style = {styles.article}
              >
                <Block>{this.renderUserItem()}</Block>
              </ScrollView>
            </Block>
            <Text h4 style={{ marginBottom: 5, paddingLeft: 20 }}>
              Suggested Users
            </Text>
            {/* <TouchableOpacity
                                    onPress={()=>{
                                        // console.log(place.place_id);
                                        this.props.navigation.navigate("SpotDetail", {
                                            spot_id: place.place_id, 
                                            added: true,
                                            destination_id: this.state.destination_id, 
                                            addSpot: this.addSpot.bind(this),
                                            removeSpot: this.removeSpot.bind(this),
                                            startDate: this.state.startDate,
                                            endDate: this.state.endDate

                                        })}
                                    }>
                                    <Category 
                                        imageUri="https://lh3.googleusercontent.com/proxy/Bj1DtAsY0dnyEBvHLs9uLDjC1MxUjBK0K5MI72KLz31jhAHegsBsbYW1BDk0yn8diISkKytYK4EMVLvHKpu74AuDHxcnBPDLln35E8YTqIzK"
                                        name="Saad"
                                        // friend={false}
                                    />
                                    </TouchableOpacity> */}
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {this.state.suggestedUsers != null &&
                this.state.suggestedUsers.map((user, i) => {
                  // console.log("GOT ITdjdbjkasbjsabj..",place);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        // console.log(place.place_id);'userProfile',{userId: this.state.foundUser}
                        this.props.navigation.navigate("userProfile", {
                          userId: user.userId,
                        });
                      }}
                    >
                      <Category
                        imageUri={user.profilePic}
                        name={user.username}
                        // friend={false}
                      />
                    </TouchableOpacity>
                  );
                })}
              {this.state.suggestedUsers.length == 0 && (
                <Text h5 style={{ left: 20 }}>
                  Sorry We don't have enough data yet!
                </Text>
              )}
            </ScrollView>
          </Block>
        )}

        {this.state.placesTab && (
          <Block center style={{ marginTop: 5 }}>
            <Block row style={{ marginTop: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: this.state.placesAroundTab
                    ? "#cccccc"
                    : "#efefef",
                  width: width * 0.25,
                  height: 40,
                  alignItems: "center",

                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
                onPress={() => {
                  this.setState({
                    placesAroundTab: true,
                    recommendedPlacesTab: false,
                    searchingTab: false,
                  });
                }}
              >
                <Text
                  h5
                  color={this.state.placesAroundTab ? "white" : "grey"}
                  style={{ marginTop: 8 }}
                >
                  Nearby
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: this.state.searchingTab
                    ? "#cccccc"
                    : "#efefef",
                  width: width * 0.25,
                  height: 40,
                  alignItems: "center",
                  borderRightColor: "grey",
                  borderRightWidth: 1,

                  borderLeftColor: "grey",
                  borderLeftWidth: 0.1,
                }}
                onPress={() => {
                  this.setState({
                    searchingTab: true,
                    placesAroundTab: false,
                    recommendedPlacesTab: false,
                  });
                }}
              >
                <Text
                  h5
                  color={this.state.searchingTab ? "white" : "grey"}
                  style={{ marginTop: 8 }}
                >
                  Search
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: this.state.recommendedPlacesTab
                    ? "#cccccc"
                    : "#efefef",
                  width: width * 0.25,
                  height: 40,
                  alignItems: "center",

                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 10,
                }}
                onPress={() => {
                  this.setState({
                    placesAroundTab: false,
                    recommendedPlacesTab: true,
                    searchingTab: false,
                  });
                }}
              >
                <Text
                  h5
                  color={this.state.recommendedPlacesTab ? "white" : "grey"}
                  style={{ marginTop: 8 }}
                >
                  Suggested
                </Text>
              </TouchableOpacity>
            </Block>

            {this.state.placesAroundTab && this.renderPlacesAround()}
            {this.state.searchingTab && this.renderSearchPlacesTab()}
            {this.state.recommendedPlacesTab && this.renderRecommendedPlaces()}
          </Block>
        )}
        {/* </ScrollView> */}
      </SafeAreaView>
    );
  }
}
export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  location: {
    height: 48,
    // width: width - 32,
    // marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0,
  },
  cardUser: {
    // paddingTop: 4,
    paddingLeft: 4,
    fontSize: 20,
    color: theme.COLORS.BLACK,
  },
  inputIcons: {
    marginRight: 12,
  },
  nameInfo: {
    marginTop: 35,
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  listUser: {
    flexDirection: "row",
    height: 50,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 0,
    borderRadius: 5,
    flex: 1,
    paddingBottom: 12,
    paddingTop: 12,
    // backgroundColor: argonTheme.COLORS.GREY,
    borderColor: argonTheme.COLORS.GREY,
  },
});
