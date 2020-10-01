import React from "react";
import {
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  AsyncStorage,
  RefreshControl,
} from "react-native";
import { Block, theme } from "galio-framework";

import { Card, Button } from "../components";
// import articles from '../constants/articles';
import { logOut } from "../services/auth.service";
import * as firebase from "firebase";
import * as Location from "expo-location";

import { Images } from "../constants";
import { FlatList } from "react-native-gesture-handler";
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from "expo-ads-admob";
import StoryThumb from "../components/StoryThumb";

const { width, height } = Dimensions.get("screen");

const images = [
  {
    id: 1,
    url:
      "https://s3.ap-south-1.amazonaws.com/hsdreams1/pins/2019/01/big/7d1e5e0b31a650b9314023921b9e161b.jpeg",
  },
  {
    id: 2,
    url:
      "https://s3.ap-south-1.amazonaws.com/hsdreams1/pins/2019/01/big/7d1e5e0b31a650b9314023921b9e161b.jpeg",
  },
  {
    id: 3,
    url:
      "https://s3.ap-south-1.amazonaws.com/hsdreams1/pins/2019/01/big/7d1e5e0b31a650b9314023921b9e161b.jpeg",
  },
  {
    id: 4,
    url:
      "https://s3.ap-south-1.amazonaws.com/hsdreams1/pins/2019/01/big/7d1e5e0b31a650b9314023921b9e161b.jpeg",
  },
  {
    id: 5,
    url:
      "https://s3.ap-south-1.amazonaws.com/hsdreams1/pins/2019/01/big/7d1e5e0b31a650b9314023921b9e161b.jpeg",
  },
];

class Home extends React.Component {
  user = firebase.auth().currentUser;
  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePostRef = firebase.firestore().collection("posts");
  firestoreFollowingRef = firebase
    .firestore()
    .collection("following")
    .doc(this.user.uid)
    .collection("userFollowing");

  // locQuery = firebase.firestore().collection("posts").doc(this.user.uid)
  // .collection("userPosts").doc(this.postId).get().then((doc)=>{
  //  location =  doc.data().location /// Is ko apny hisab sa use kr
  // })

  state = {
    posts: [],
    userData: {},
    followedUsers: [],
    avatar: Images.ProfilePicture,
    refreshing: false,
    lastDoc: null,
    getNextPosts: false,
    lastDocArr: [],
    xyz: [],
  };

  // componentWillMount= () =>{
  //   // this.getPosts();
  //   this.getProfilePic();
  //   this.getFollowedUsers();
  //   // this.getFollowingPosts();
  // }

  componentDidMount = () => {
    // this.getProfilePic();
    this.getLocationAsync();
    this.getFollowingPosts();
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

  // Get all posts of each user and push them in a same array
  getFollowingPosts = async () => {
    // 1. Get all the users the current user is following
    await this.getFollowedUsers().then(async () => {
      // console.log(this.state.followedUsers);

      let users = this.state.followedUsers;
      let allPosts = [];
      let lastDocArr = [];

      // 2. Get posts of each user seperately and putting them in one array.
      //  users.forEach(async (user) => {
      for (const user of users) {
        let userObj = new Object();
        userObj.user = user;

        await this.getProfilePic(user).then(async () => {
          // console.log("Avatar:" +this.state.avatar)
          await this.firestoreUsersRef
            .doc(user)
            .get()
            .then(async (document) => {
              this.setState({ userData: document.data() });

              const startQuery = this.firestorePostRef
                .doc(user)
                .collection("userPosts")
                .orderBy("time", "desc");

              await startQuery.get().then(async (snapshot) => {
                var lastVisible = snapshot.docs[snapshot.docs.length - 1];
                //  this.setState({lastDoc: lastVisible.id});
                userObj.lastDoc = lastVisible.data().postId;

                lastDocArr.push(userObj);
                snapshot.forEach((doc) => {
                  let article = {
                    username: this.state.userData.username,
                    userId: user,
                    title: "post",
                    avatar: this.state.avatar,
                    image: doc.data().image,
                    cta: "cta",
                    caption: doc.data().caption,
                    location: doc.data().location.locationName,
                    postId: doc.data().postId,
                    timeStamp: doc.data().time,
                    horizontal: true,
                  };
                  allPosts.push(article);
                });
              });

              // console.log(lastDocArr)
              this.setState({ posts: allPosts });
            });
        });
      }
      this.setState({ xyz: lastDocArr });
    });
    console.log(this.state.xyz);
  };

  // Get More posts on scrolling posts of each user and push them in a same array
  getMorePosts = async () => {
    // console.log(this.state.followedUsers);

    let users = this.state.followedUsers;
    let allPosts = this.state.posts;
    let lastDocArr = this.state.xyz;
    let userObj = {};
    let currentUserObj = {};
    // 2. Get posts of each user seperately and putting them in one array.
    //  users.forEach(async (user) => {
    for (const user of users) {
      console.log("PRE ARRAY:            " + lastDocArr);

      userObj.user = user;
      lastDocArr.map((userObj) => {
        console.log(userObj);
        if (userObj.user == user) {
          currentUserObj = userObj;
          lastDocArr.pop();
        }
      });

      this.setState({ lastDocArr: lastDocArr });
      console.log("NEW ARRAY:            " + lastDocArr);

      let currentUserLastDoc = currentUserObj.lastDoc;
      console.log("Current USer Last DOc is: " + currentUserLastDoc);
      await this.getProfilePic(user).then(async () => {
        // console.log("Avatar:" +this.state.avatar)
        await this.firestoreUsersRef
          .doc(user)
          .get()
          .then(async (document) => {
            this.setState({ userData: document.data() });

            const nextQuery = this.firestorePostRef
              .doc(user)
              .collection("userPosts")
              .orderBy("time", "desc")
              .limit(1)
              .startAfter(currentUserLastDoc)
              .limit(1);
            // console.log(document.data());

            await nextQuery.get().then(async (snapshot) => {
              var lastVisible = snapshot.docs[snapshot.docs.length - 1];
              this.setState({ lastDoc: lastVisible.id });
              userObj.lastDoc = lastVisible.data().postId;
              snapshot.forEach((doc) => {
                let article = {
                  username: this.state.userData.username,
                  userId: user,
                  title: "post",
                  avatar: this.state.avatar,
                  image: doc.data().image,
                  cta: "cta",
                  caption: doc.data().caption,
                  location: doc.data().location.locationName,
                  postId: doc.data().postId,
                  timeStamp: doc.data().time,
                  horizontal: true,
                };
                allPosts.push(article);
              });
              lastDocArr.push(userObj);
            });

            this.setState({ posts: allPosts });
          });
      });
      // allPosts.sort(function(a,b){
      //   // Turn your strings into dates, and then subtract them
      //   // to get a value that is either negative, positive, or zero.
      //   return new Date(b.timeStamp) - new Date(a.timeStamp) ;
      // });

      // this.setState({posts: allPosts});
      // console.log(this.state.posts);
    }

    this.setState({ xyz: lastDocArr });
    console.log(lastDocArr);
  };

  getProfilePic = async (user) => {
    const firebaseProfilePic = await firebase
      .storage()
      .ref()
      .child("profilePics/(" + user + ")ProfilePic");
    firebaseProfilePic
      .getDownloadURL()
      .then((url) => {
        // console.log("got profile pic of" +user + url);
        this.setState({ avatar: url });
        // console.log(this.state.avatar);

        return url;
      })
      .catch((error) => {
        // Handle any errors
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            this.setState({ avatar: Images.ProfilePicture });
            return Images.ProfilePicture;
            break;
        }
        alert(error);
      });
  };
  onRefresh = () => {
    this.setState({ refreshing: true });

    this.getFollowingPosts().then(() => {
      this.setState({ refreshing: false });
    });
  };

  getNextPosts = () => {
    this.setState({ getNextPosts: true });
    // alert(this.state.lastDoc)
    // this.getMorePosts();
  };

  renderStories = () => {
    return (
      <Block flex={1}>
        <Block
          style={{
            marginTop: 10,
            borderRadius: 20,
            backgroundColor: "#ededed",
            height: height * 0.12,
            width: width * 0.95,
          }}
        >
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            data={images}
            renderItem={({ item }) => <StoryThumb avatar={item.url} />}
            keyExtractor={(item) => item.id}
          />
        </Block>
      </Block>
    );
  };
  renderArticles = () => {
    return (
      <Block flex={8}>
        {!this.state.posts.length > 0 && (
          <Block style={{ paddingTop: 30 }}>
            <ActivityIndicator size="large" />
          </Block>
        )}
        <FlatList
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={this.getNextPosts}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          data={this.state.posts}
          renderItem={({ item }) => <Card item={item} for={"feed"} full />}
          keyExtractor={(item) => item.postId}
        />
      </Block>
    );
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        {/* <AdMobBanner
          bannerSize="banner"
          adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
          servePersonalizedAds // true or false
          // onDidFailToReceiveAdWithError={this.bannerError}
          />
          <PublisherBanner
          bannerSize="banner"
          adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
          // onDidFailToReceiveAdWithError={this.bannerError}
          onAdMobDispatchAppEvent={this.adMobEvent}
        /> */}
        {this.renderStories()}
        {/* {this.renderArticles()} */}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  articles: {
    width: width,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default Home;
