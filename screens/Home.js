import React from "react";
import {
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  AsyncStorage,
  FlatList,
  RefreshControl,
} from "react-native";
import { Block, Icon, theme, Text } from "galio-framework";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

import { Card, Button } from "../components";
// import articles from '../constants/articles';
import { logOut } from "../services/auth.service";
import * as firebase from "firebase";
import * as Location from "expo-location";

import { Images } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from "expo-ads-admob";
import StoryThumb from "../components/StoryThumb";
import { getKeywords } from "../src/CustomFunctions";

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
  {
    id: 6,
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
    currentUsername: "",
    currentAvatar: "",
    userData: {},
    followedUsers: [],
    avatar: Images.ProfilePicture,
    refreshing: false,
    lastDoc: null,
    getNextPosts: false,
    lastDocArr: [],
    xyz: [],
    stories: [],
    myStories: [],
    lastDoc: "",
  };

  // componentWillMount= () =>{
  //   // this.getPosts();
  //   this.getProfilePic();
  //   this.getFollowedUsers();
  //   // this.getFollowingPosts();
  // }

  updateKeywords = () => {
    firebase
      .firestore()
      .collection("users")
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          let currUsername = doc.data().name.toLowerCase();
          let keywords = getKeywords(currUsername);
          firebase
            .firestore()
            .collection("users")
            .doc(doc.id)
            .set(
              {
                nameKeywords: keywords,
              },
              { merge: true }
            )
            .then(() => {
              console.log("UPDATED USER", currUsername);
            });
        });
      })
      .catch((err) => {
        console.log("HEAVY ERR", err);
      });
  };

  componentDidMount = async () => {
    // this.getProfilePic();
    // this.getLocationAsync();

    // this.updateKeywords();
    await this.getFollowedUsers().then(async () => {
      // console.log(this.state.followedUsers);
      this.getMyStories();
      this.getFollowingStories();
    });
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
    await firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("following")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((docSnap) => {
          users.push(docSnap.id);
        });
        // this.setState({followedUsers: users});
      });
    this.setState({ followedUsers: users });
    // console.log(this.state.followedUsers);
  };

  getMyStories = async () => {
    let userId = this.user.uid;
    let username,
      userAvatar = null;
    let storiesArr = [];
    let stories = [];
    this.firestoreUsersRef
      .doc(this.user.uid)
      .get()
      .then((doc) => {
        let data = doc.data();
        username = data.username;
        userAvatar = data.profilePic;
        this.setState({ currentUsername: username, currentAvatar: userAvatar });
      })
      .then(() => {
        let fetchTimestamp = new Date().getTime();
        this.firestoreUsersRef
          .doc(this.user.uid)
          .collection("stories")
          .where("expireTimestamp", ">=", fetchTimestamp)
          .onSnapshot((docs) => {
            if (docs.size > 0) {
              let myStoryObj = {
                userId: userId,
                username: username,
                userAvatar: userAvatar,
              };
              docs.forEach((doc) => {
                let story = doc.data();
                let uploadTime = story.currentTimestamp;

                let timestampDiff = fetchTimestamp - uploadTime;
                timestampDiff = timestampDiff / 3600000;
                timestampDiff = Math.round(timestampDiff);

                let storyObj = {
                  content: story.downloadURL,
                  uploaded: timestampDiff + "hours before",
                };

                storiesArr.push(storyObj);
                myStoryObj.stories = storiesArr;
              });
              stories.push(myStoryObj);
            }
          });

        this.setState({ myStories: stories }, () =>
          console.log("sbs", this.state.myStories)
        );
      })
      .catch((err) => alert(err));
  };

  getFollowingStories = async () => {
    let users = this.state.followedUsers;
    let stories = [];
    for (const user of users) {
      let userObj = new Object();
      userObj.user = user;

      // console.log("Avatar:" +this.state.avatar)
      await this.firestoreUsersRef
        .doc(user)
        .get()
        .then(async (document) => {
          let userData = document.data();
          let fetchTimestamp = new Date().getTime();

          let storiesArr = [];
          this.firestoreUsersRef
            .doc(user)
            .collection("stories")
            .where("expireTimestamp", ">=", fetchTimestamp)
            .get()
            .then((docs) => {
              if (docs.size > 0) {
                let userStoryObj = {
                  userId: user,
                  username: userData.username,
                  userAvatar: userData.profilePic,
                };
                docs.forEach((doc) => {
                  let story = doc.data();
                  let uploadTime = story.currentTimestamp;

                  let timestampDiff = fetchTimestamp - uploadTime;
                  timestampDiff = timestampDiff / 3600000;
                  timestampDiff = Math.round(timestampDiff);

                  let storyObj = {
                    content: story.downloadURL,
                    uploaded: timestampDiff + "hours before",
                  };

                  storiesArr.push(storyObj);
                  userStoryObj.stories = storiesArr;
                });
                stories.push(userStoryObj);
              }
            });
        });
    }
    this.setState({ stories: stories });
    console.log(stories);
  };

  // Get all posts of each user and push them in a same array
  getFollowingPosts = async () => {
    let allPosts = [];
    this.setState({ allPosts: [] });
    firebase
      .firestore()
      .collection("timeline")
      .doc(this.user.uid)
      .collection("timelinePosts")
      .orderBy("time", "desc")
      .limit(5)
      .onSnapshot((posts) => {
        let lastDoc = posts.docs[posts.docs.length - 1];
        this.setState({ lastDoc });
        posts.forEach((post) => {
          let data = post.data();
          let article = {
            username: data.username,
            userId: data.userId,
            title: "post",
            avatar: data.userAvatar,
            image: data.image,
            cta: "cta",

            video: data.type == "video" ? data.video : "",
            type: data.type,
            caption: data.caption,
            location: data.location.locationName,
            postId: data.postId,
            timeStamp: data.time,
            horizontal: true,
          };
          allPosts.push(article);
        });

        // console.log(lastDocArr)
        this.setState({ posts: allPosts }, () =>
          console.log("ALL POSTS", this.state.posts)
        );
      });
  };

  // Get More posts on scrolling posts of each user and push them in a same array
  getMorePosts = async () => {
    this.setState({ refreshing: true });

    let allPosts = this.state.posts.length ? this.state.posts : [];
    let lastDoc = this.state.lastDoc;
    firebase
      .firestore()
      .collection("timeline")
      .doc(this.user.uid)
      .collection("timelinePosts")
      .orderBy("time", "desc")
      .startAfter(lastDoc)
      .limit(5)
      .onSnapshot((posts) => {
        let lastDoc = posts.docs[posts.docs.length - 1];
        this.setState({ lastDoc });
        posts.forEach((post) => {
          let data = post.data();
          let article = {
            username: data.username,
            userId: data.userId,
            title: "post",
            avatar: data.userAvatar,
            image: data.image,
            cta: "cta",

            video: data.type == "video" ? data.video : "",
            type: data.type,
            caption: data.caption,
            location: data.location.locationName,
            postId: data.postId,
            timeStamp: data.time,
            horizontal: true,
          };
          allPosts.push(article);
        });

        // console.log(lastDocArr)
        this.setState({ posts: allPosts, refreshing: false }, () =>
          console.log("ALL POSTS", this.state.posts)
        );
      });
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
    this.setState({ refreshing: true }, () => {
      this.getFollowingPosts().then(() => {
        this.getFollowingStories();
        this.setState({ refreshing: false });
      });
    });
  };

  getNextPosts = () => {
    this.setState({ getNextPosts: true });
    // alert(this.state.lastDoc)
    // this.getMorePosts();
  };

  storeStoryInFirestore = (downloadURL, currentTimestamp, expireTimestamp) => {
    // console.log(downloadURL, currentTimestamp, expireTimestamp);
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("stories")
      .add({
        downloadURL: downloadURL,
        currentTimestamp: currentTimestamp,
        expireTimestamp: expireTimestamp,
      })
      .then(() => {
        alert("Story Saved!");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  uploadStory = async (uri, imageName, currentTimestamp, expireTimestamp) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const ref = firebase
      .storage()
      .ref()
      .child("storyPics/" + imageName);

    // ref.getDownloadURL().then((url) => {
    // console.log(url);
    ref
      .put(blob)
      .then(() => {
        ref.getDownloadURL().then((url) => {
          this.storeStoryInFirestore(url, currentTimestamp, expireTimestamp);
        });
      })
      .catch((err) => {
        console.log(err);
      });
    // });
  };

  addStory = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.1,
    });

    let uploadTimestamp = new Date().getTime();
    let expireTimestamp = uploadTimestamp + 86400000;
    // console.log(result);

    if (!result.cancelled) {
      this.uploadStory(
        result.uri,
        "(" + this.user.uid + ")" + uploadTimestamp,
        uploadTimestamp,
        expireTimestamp
      );
    }
  };

  renderStories = () => {
    return (
      <Block flex={1.5}>
        <Block
          row
          style={{
            marginTop: 10,
            borderRadius: 35,
            backgroundColor: "#ededed",
            height: 70,
            width: width * 0.95,
          }}
        >
          {!this.state.myStories.length > 0 ? (
            <Block style={{ margin: 5 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#ebebeb",
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  alignItems: "center",
                }}
                onPress={() => {
                  this.addStory();
                }}
              >
                <Icon
                  size={30}
                  name="plus"
                  family="antdesign"
                  style={{ top: 12 }}
                  color={"black"}
                />
              </TouchableOpacity>
            </Block>
          ) : (
            <Block style={{ marginLeft: 5 }}>
              <StoryThumb
                avatar={this.state.currentAvatar}
                stories={this.state.myStories[0]}
                viewed
                addStory={this.addStory}
                myStory
              />
            </Block>
          )}

          {this.state.stories.length > 0 ? (
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              data={this.state.stories}
              renderItem={({ item }) => (
                <StoryThumb avatar={item.userAvatar} stories={item} viewed />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <Text style={{ marginTop: 25 }}>No recent stories!</Text>
          )}
        </Block>
      </Block>
    );
  };
  renderArticles = () => {
    return (
      <Block flex={8} style={{ marginTop: 5 }}>
        {!this.state.posts.length > 0 && !this.state.refreshing && (
          <Block style={{ paddingTop: 30 }}>
            <ActivityIndicator size="large" color="gray" />
          </Block>
        )}
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          onEndReached={this.getMorePosts}
          onEndReachedThreshold={3}
          data={this.state.posts}
          renderItem={({ item }) => <Card item={item} for={"feed"} full />}
          keyExtractor={(item) => item.postId}
        />

        {/* <TouchableOpacity
          style={{ backgroundColor: "grey" }}
          onPress={this.getMorePosts}
        >
          Get more posts
        </TouchableOpacity> */}
      </Block>
    );
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderStories()}
        <Block style={{ marginTop: 10 }} />
        <AdMobBanner
          bannerSize="banner"
          adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
          servePersonalizedAds // true or false
          // onDidFailToReceiveAdWithError={this.bannerError}
        />
        {/* <PublisherBanner
          bannerSize="banner"
          adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
          // onDidFailToReceiveAdWithError={this.bannerError}
          onAdMobDispatchAppEvent={this.adMobEvent}
        /> */}
        {this.renderArticles()}
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
