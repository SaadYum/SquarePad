import React from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import Heatmap from "react-native-maps";

import { StyleSheet, Text, View, Dimensions } from "react-native";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import * as firebase from "firebase";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { key } from "../googleAPIKey";

// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=AIzaSyC3jftuRYj7vJ5cB-HGvzq6fC60WXOCtoM

export default class Maps extends React.Component {
  userId = firebase.auth().currentUser.uid;
  currentUserRef = firebase.firestore().collection("users").doc(this.userId);
  firestoreFollowingRef = firebase
    .firestore()
    .collection("following")
    .doc(this.userId)
    .collection("userFollowing");
  firestoreUserRef = firebase.firestore().collection("users");

  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePostRef = firebase.firestore().collection("posts");

  state = {
    latitude: null,
    longitude: null,
    places: null,
    heatPoints: null,
    location: null,
    region: null,
    errorMessage: null,
    lastSeen: null,
    currentUsername: "",
    followedUsers: [],
    followingUserMarkers: [],
    posts: [],
    heatMapData: [],
    loading: false,
  };

  getProfilePic = async (user) => {
    const firebaseProfilePic = await firebase
      .storage()
      .ref()
      .child("profilePics/(" + user + ")ProfilePic");
    firebaseProfilePic
      .getDownloadURL()
      .then((url) => {
        this.setState({ avatar: url });
        console.log(this.state.avatar);

        return url;
      })
      .catch((error) => {
        // Handle any errors
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            this.setState({
              avatar:
                "https://clinicforspecialchildren.org/wp-content/uploads/2016/08/avatar-placeholder.gif",
            });
            return "https://clinicforspecialchildren.org/wp-content/uploads/2016/08/avatar-placeholder.gif";
          // break;
        }
        alert(error);
      });
  };

  getFollowingPosts = async () => {
    // 1. Get all the users the current user3 is following
    // await this.getFollowedUsers().then(async () => {
    // console.log(this.state.followedUsers);

    let users = this.state.followedUsers;
    let allPosts = [];

    // 2. Get posts of each user3 seperately and putting them in one array.
    //  users.forEach(async (user3) => {
    for (const user of users) {
      await this.getProfilePic(user).then(async () => {
        console.log("Avatar:" + this.state.avatar);
        await this.firestoreUsersRef
          .doc(user)
          .get()
          .then(async (document) => {
            this.setState({ userData: document.data() });
            // console.log("userdadatdatdtad: "+this.state.userData)
            // console.log(document.data());
            await this.firestorePostRef
              .doc(user)
              .collection("userPosts")
              .orderBy("time", "desc")
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  let article = {
                    username: this.state.userData.username,
                    userId: user,
                    title: "post",
                    avatar: this.state.avatar,
                    image: doc.data().image,
                    cta: "cta",
                    caption: doc.data().caption,
                    location: doc.data().location.coordinates,
                    postId: doc.data().postId,
                    timeStamp: doc.data().time,
                    // likes:0,
                    // horizontal: true
                  };
                  allPosts.push(article);
                });
              });

            this.setState({ posts: allPosts });
          });
      });
    }
    // });
  };

  getHeatMapData = () => {
    this.setState({ loading: true });

    let data = [];
    let postTag = [];
    let posts = this.state.posts;
    posts.forEach((post) => {
      let point = {
        latitude: parseFloat(post.location.lat),
        longitude: parseFloat(post.location.lng),
        weight: 10,
      };
      data.push(point);
      postTag.push(post.postId);
    });
    this.setState({ heatMapData: data, postId: postTag });
    this.setState({ loading: false });

    // console.log(this.state.heatMapData);
    // console.log("oioioioio");
    // // console.log(this.state.userData.location.lastSeen);
    // console.log(data);
    // console.log(this.state.postId);
  };

  componentWillMount = () => {
    this.getLocationAsync();
    this.getCurrentUsername();
    this.getFollowedUsers().then(() => {
      this.getLocationsOfFollowedUsers();
      this.getFollowingPosts().then(() => {
        this.getHeatMapData();
        //  this.getUserLastSeen();

        // this.onClick();
      });
    });
    // this.updateFirebaseLocation();
  };

  // updateFirebaseLocation = ()=>{
  // this.getLocationAsync();
  // let latitude = this.state.region.latitude;
  // let longitude = this.state.region.longitude;

  // }

  getLocationAsync = async () => {
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

    this.setState({ region: region, lastSeen: time });
    // console.log(this.state.region, " Time: " + time);

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
  };

  getLocationsOfFollowedUsers = () => {
    // this.getFollowedUsers().then(() => {
    const followedUsers = this.state.followedUsers;
    const userMarkers = [];
    followedUsers.forEach((user, index) => {
      this.firestoreUsersRef
        .doc(user)
        .get()
        .then((doc) => {
          let docData = doc.data();

          if (docData.location) {
            // console.log(docData.location);

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
                // style={{ height: 30, width: 30, borderRadius: 15 }}
              >
                {/* <Image
                  source={require("../assets/imgs/profilePic.png")}
                  style={{ height: 30, width: 30, borderRadius: 15 }}
                /> */}
                <Callout>
                  <View>
                    <Text>{userName}</Text>
                    <Text>Last Seen: {lastSeen}</Text>
                    {/* <Text>Open: {marker.opening_hours.open_now ? "YES" : "NO"}</Text> */}
                  </View>
                </Callout>
              </Marker>
            );

            // console.log(userMarkers);
            this.setState({
              followingUserMarkers: userMarkers,
            });
          }
        });
    });
    // });
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

  getCurrentUsername = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((document) => {
        this.setState({
          currentUsername: document.data().username,
        });
        // console.log(this.state.currentUsername);
      });
  };

  handleChangeLocation = (location) => {
    let region = {
      latitude: location.nativeEvent.coordinate.latitude,
      longitude: location.nativeEvent.coordinate.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.setState({ region: region });
  };

  onRegionChange = (region) => {
    this.setState({ region });
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.state.errorMessage && this.state.region ? (
          <MapView
            showsUserLocation
            provider={"google"}
            style={styles.mapStyle}
            region={this.state.region}
            showsMyLocationButton={true}
            showsCompass={true}
            showsPointsOfInterest={true}
            // showsTraffic={true}
            // mapType={"standard"}
            // onRegionChange={this.onRegionChange}
            // onUserLocationChange={this.handleChangeLocation}
          >
            {this.state.followingUserMarkers}
            {this.state.heatMapData.length > 0 && (
              <MapView.Heatmap
                opacity={1}
                radius={50}
                maxIntensity={100}
                gradientSmoothing={10}
                heatmapMode={"POINTS_DENSITY"}
                points={
                  //    [
                  //    {
                  //      latitude: 33.6844,
                  //      longitude: 73.0479,
                  //      weight: 10,
                  //    }
                  //  ]
                  this.state.heatMapData
                }
              />
            )}
          </MapView>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapStyle: {
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height * 0.8,
  },
});
