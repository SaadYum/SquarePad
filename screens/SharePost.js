import React from "react";
import {
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  AsyncStorage,
  RefreshControl,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Block, theme, Text, Input } from "galio-framework";

import { Card, Button, Select, Icon } from "../components";
// import articles from '../constants/articles';
import { logOut } from "../services/auth.service";
import * as firebase from "firebase";
import { Images } from "../constants";
import { FlatList } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import GroupCard from "../components/GroupCard";
import Spinner from "react-native-loading-spinner-overlay";

const { width } = Dimensions.get("screen");
const { height } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 2;

class SharePost extends React.Component {
  user = firebase.auth().currentUser;
  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePostRef = firebase.firestore().collection("posts");
  firestoreFollowingRef = firebase
    .firestore()
    .collection("following")
    .doc(this.user.uid)
    .collection("userFollowing");

  state = {
    group: this.props.navigation.getParam("group"),
    spinner: false,
    username: "",
    avatar: "",
    country: "uk",
    foundGroups: [],
    myGroups: [],
    searchWord: "",
    searching: false,
    refreshing: false,
    myGroupsTab: true,
    suggestedTab: false,
    posts: [],
    testPosts: [
      {
        avatar:
          "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2F(niKoNaL9NeOPx7iW4jDUi5Cqyht2)ProfilePic?alt=media&token=feae649e-c310-4760-b8b8-9145323f162b",
        caption: "",
        cta: "cta",
        horizontal: true,
        image:
          "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/postImages%2FaEutLSN8lWRaLzym9iE7?alt=media&token=01345366-57bb-443b-b2ae-a8ee61d15da4",
        location: "Lahore",
        postId: "aEutLSN8lWRaLzym9iE7",
        timeStamp: {
          nanoseconds: 872000000,
          seconds: 1580802544,
        },
        title: "post",
        userId: "niKoNaL9NeOPx7iW4jDUi5Cqyht2",
        username: "Saad_Rehman",
      },
      {
        avatar:
          "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2F(niKoNaL9NeOPx7iW4jDUi5Cqyht2)ProfilePic?alt=media&token=feae649e-c310-4760-b8b8-9145323f162b",
        caption: "",
        cta: "cta",
        horizontal: true,
        image:
          "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/postImages%2FaEutLSN8lWRaLzym9iE7?alt=media&token=01345366-57bb-443b-b2ae-a8ee61d15da4",
        location: "Lahore",
        postId: "aEutLSN8lWRaLzym9iE6",
        timeStamp: {
          nanoseconds: 872000000,
          seconds: 1580802544,
        },
        title: "post",
        userId: "niKoNaL9NeOPx7iW4jDUi5Cqyht2",
        username: "Saad_Rehman",
      },
      {
        avatar:
          "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2F(niKoNaL9NeOPx7iW4jDUi5Cqyht2)ProfilePic?alt=media&token=feae649e-c310-4760-b8b8-9145323f162b",
        caption: "",
        cta: "cta",
        horizontal: true,
        image:
          "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/postImages%2FaEutLSN8lWRaLzym9iE7?alt=media&token=01345366-57bb-443b-b2ae-a8ee61d15da4",
        location: "Lahore",
        postId: "aEutLSN8lWRaLzym9iE8",
        timeStamp: {
          nanoseconds: 872000000,
          seconds: 1580802544,
        },
        title: "post",
        userId: "niKoNaL9NeOPx7iW4jDUi5Cqyht2",
        username: "Saad_Rehman",
      },
    ],
    groupId: "",
  };
  confirmChoice = async (post) => {
    const selection = await new Promise((resolve) => {
      const title = "Share!";
      const message = "Confirm";
      const buttons = [
        { text: "Share", onPress: () => resolve("Share") },
        { text: "Cancel", onPress: () => resolve(null) },
      ];
      Alert.alert(title, message, buttons);
    });

    if (selection == "Share") {
      this.setState({ spinner: true });
      firebase
        .firestore()
        .collection("groups")
        .doc(this.state.group.groupId)
        .collection("discussion")
        .doc(post.postId)
        .set({
          avatar: this.state.avatar,
          caption: post.caption,
          cta: "cta",
          horizontal: true,
          image: post.image,
          location: post.location.locationName,
          postId: post.postId,
          time: post.time,
          title: "post",
          userId: this.user.uid,
          username: this.state.username,
        })
        .then(() => {
          this.setState({ spinner: false });
          this.props.navigation.goBack();
        })
        .catch((err) => {
          this.setState({ spinner: false });

          alert(err);
        });
    } else {
      return;
    }
  };

  getProfilePic = () => {
    const firebaseProfilePic = firebase
      .storage()
      .ref()
      .child("profilePics/(" + this.user.uid + ")ProfilePic");
    firebaseProfilePic
      .getDownloadURL()
      .then((url) => {
        this.setState({ avatar: url });
      })
      .catch((error) => {
        // Handle any errors
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            this.setState({ avatar: Images.ProfilePicture });
            break;
        }
        alert(error);
      });
  };

  getUserData = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .get()
      .then((doc) => {
        this.setState({ username: doc.data().username });
      });
  };
  getPosts = () => {
    var cloudImages = [];
    firebase
      .firestore()
      .collection("posts")
      .doc(this.user.uid)
      .collection("userPosts")
      .orderBy("time", "desc")
      .onSnapshot((snapshot) => {
        cloudImages = [];
        snapshot.forEach((doc) => {
          cloudImages.push(doc.data());
        });

        //  console.log(cloudImages);
        this.setState({ posts: cloudImages.map((post) => post) });
      });
  };

  UNSAFE_componentWillMount = () => {
    this.getProfilePic();
    this.getUserData();
    this.getPosts();
  };
  renderPosts = () => {
    let myGroups = this.state.myGroups;

    return (
      <Block flex center style={styles.home}>
        <Block
          row
          style={{ marginTop: 10, zIndex: 2, alignSelf: "flex-start" }}
        >
          <Text h3 color="grey" style={{ left: 33 }}>
            Posts
          </Text>
        </Block>
        <Block style={{ paddingBottom: 10, width: width * 0.8 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Block row space="between" style={{ flexWrap: "wrap" }}>
              {/* {Images.Viewed.map((img, imgIndex) => ( */}
              {this.state.posts.map((post, postIndex) => (
                <TouchableOpacity
                  key={postIndex}
                  onPress={() => this.confirmChoice(post)}
                >
                  <Image
                    source={{ uri: post.image }}
                    key={`viewed-${post.image}`}
                    resizeMode="cover"
                    style={styles.thumb}
                  />
                </TouchableOpacity>
              ))}
            </Block>
          </ScrollView>
        </Block>
      </Block>
    );
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
  };

  render() {
    return (
      <Block>
        {/* <Image source ={{}}/> */}
        <Spinner
          visible={this.state.spinner}
          textContent={"Sharing.."}
          textStyle={{ color: "#FFF" }}
        />
        <ImageBackground
          source={Images.groupsMain}
          style={styles.profileContainer}
          imageStyle={styles.profileBackground}
        >
          <Block left>
            <TouchableOpacity
              style={{
                left: 20,
                top: 30,
              }}
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon
                family="antdesign"
                size={30}
                style={{ left: 5 }}
                color={"grey"}
                name="leftcircle"
              />
            </TouchableOpacity>
          </Block>
          <Block flex left center style={{ marginTop: 80 }}>
            <Block row>
              <Text h2 color="#ebebeb" style={{ left: 20 }}>
                {this.state.group.groupTitle}
              </Text>
            </Block>

            {this.state.myGroupsTab && this.renderPosts()}
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    marginTop: 10,
    width: width,
    backgroundColor: "white",
    borderRadius: 25,
  },

  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1,
  },
  profileBackground: {
    width: width,
    height: height * 0.3,
  },
  articles: {
    width: width,
    paddingVertical: theme.SIZES.BASE,
  },
  search: {
    height: 48,
    width: width * 0.8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 15,
    // marginTop: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },

  thumb: {
    borderRadius: 10,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
});

export default SharePost;
