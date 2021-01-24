import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  Alert,
  AsyncStorage,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { Card, ListItem } from "react-native-elements";

import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import * as firebase from "firebase";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native-gesture-handler";
import { getPosts } from "../constants/Images";
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  // console.log("YESS", state)
  return {
    notifications: state.chatReducer.notifications,
  };
};

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

const getPost = async (postId, userId) => {
  let post = {};
  await firebase
    .firestore()
    .collection("posts")
    .doc(userId)
    .collection("userPosts")
    .doc(postId)
    .get()
    .then(async (doc) => {
      let postObj = doc.data();
      await firebase
        .firestore()
        .collection("users")
        .doc(userId)
        .get()
        .then(async (doc) => {
          postObj.username = doc.data().username;
          await getProfilePic(userId).then((avatar) => {
            console.log("Blessed", avatar);
            postObj.avatar = avatar;
          });
        });
      post = postObj;
    });
  return post;
};

const getProfilePic = async (user) => {
  const firebaseProfilePic = firebase
    .storage()
    .ref()
    .child("profilePics/(" + user + ")ProfilePic");

  let url = await firebaseProfilePic
    .getDownloadURL()
    .then((url) => {
      url = url;
      return url;
    })
    .catch((error) => {
      // Handle any errors
      switch (error.code) {
        case "storage/object-not-found":
          url = Images.ProfilePicture;
          return url;
          break;
      }
      alert(error);
    });
  return url;
};

const onPlanRequest = async (props) => {
  const selection = await new Promise((resolve) => {
    const title = "Plan Request";
    const message = props.content;
    const buttons = [
      { text: "Accept", onPress: () => resolve("Accept") },
      { text: "Reject", onPress: () => resolve("Reject") },
      { text: "Later", onPress: () => resolve(null) },
    ];
    Alert.alert(title, message, buttons);
  });
  if (selection == "Accept") {
    props.joinPlan(props.item);
  } else if (selection == "Reject") {
    props.rejectPlan(props.item);
  } else {
    return;
  }
};

const onGroupInvitation = async (props) => {
  props.navigation.navigate("Group", { group: props.group });
};

const NotificationItem = (props) => {
  const item = props.item;
  const [post, setPost] = useState({});

  useEffect(() => {
    if (props.item.type == "comment" || props.item.type == "like") {
      console.log("USER ID", item.userId, "POST ID", item.source);
      let userId = item.userId;
      firebase
        .firestore()
        .collection("posts")
        .doc(firebase.auth().currentUser.uid)
        .collection("userPosts")
        .doc(item.source)
        .get()
        .then((doc) => {
          if (doc.exists) {
            let postData = doc.data();
            console.log("POSAT", postData);
            // console.log("POSAT ITEM", item);
            setPost(postData);
          } else {
            console.log("POSAT", "NO DATA");
          }
        });
    }
  }, []);
  return (
    <Block
      style={{
        marginHorizontal: 1,
        marginTop: 5,
        borderRadius: 15,
        backgroundColor: "#f5f5f5",
      }}
    >
      <TouchableOpacity
        onPress={() => {
          let type = props.item.type;

          switch (type) {
            case "comment":
              props.navigation.navigate("NotificationPost", {
                username: item.username,
                title: "",
                avatar: item.avatar,
                image: post.image,
                cta: "View article",
                caption: post.caption,
                video: post.type == "video" ? post.video : "",
                type: post.type,
                location: post.location.locationName,
                postId: post.postId,
                userId: post.userId,
              });
              break;
            case "like":
              props.navigation.navigate("NotificationPost", {
                username: item.username,
                title: "",
                avatar: item.avatar,
                image: post.image,
                cta: "View article",
                caption: post.caption,
                video: post.type == "video" ? post.video : "",
                type: post.type,
                location: post.location.locationName,
                postId: post.postId,
                userId: post.userId,
              });
              break;
            case "follow":
              props.navigation.navigate("NotificationProfile", {
                userId: props.item.userId,
              });
              break;
            // alert(type);
            case "request":
              alert(type);
              break;
            case "chat":
              alert(type);
              break;
            default:
              break;
          }
        }}
      >
        <Block>
          <Block style={{ flexDirection: "row", width: width * 0.9 }}>
            <Block style={{ margin: 5 }}>
              <Image
                source={{ uri: props.item.avatar }}
                style={styles.avatar}
              />
            </Block>

            <Text
              style={{ marginTop: 20, marginHorizontal: 10, marginBottom: 7 }}
            >
              {props.item.username + " " + props.item.content}
            </Text>

            {/* <Text style={{ marginBottom: 15, marginHorizontal: 10 }}>
            {props.content}
          </Text> */}
          </Block>
        </Block>
      </TouchableOpacity>
      {props.item.type == "request" ? (
        <Block style={{ flexDirection: "row", left: 70, paddingBottom: 20 }}>
          <Button
            small
            color="grey"
            round
            style={{ width: 100 }}
            onPress={() => {
              props.handleAccept(props.item.userId);
            }}
          >
            Accept
          </Button>
          <Button
            small
            round
            color="tomato"
            style={{ width: 100, left: 10 }}
            onPress={() => {
              props.handleReject(props.item.userId);
            }}
          >
            Reject
          </Button>
        </Block>
      ) : null}
    </Block>
  );
};

class Notifications extends React.Component {
  user = firebase.auth().currentUser;
  currUserId = this.user.uid;
  constructor(props) {
    super(props);
    //does whatever stuff
    this.state = {
      notifications: this.props.notifications,
      refreshing: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.notifications != this.props.notifications) {
      console.log("NEW NOTIFICATIONS");
      this.setState({ notifications: this.props.notifications });
    }
  }

  firestoreNotificationRef = firebase
    .firestore()
    .collection("notifications")
    .doc(this.user.uid)
    .collection("userNotifications");

  firestoreUsersRef = firebase.firestore().collection("users");

  storageRef = firebase.storage().ref();

  renderAvatar = () => {
    const { avatar, item } = this.props;
    return (
      <Image source={{ uri: this.state.profilePic }} style={styles.avatar} />
    );
  };

  onRefresh = () => {
    // this.setState({ refreshing: true });
    // this.getNotifications();
  };

  handleAccept = (uId) => {
    this.firestoreUsersRef
      .doc(this.currUserId)
      .collection("followedBy")
      .doc(uId)
      .set({
        userId: uId,
      }) &&
      this.firestoreUsersRef
        .doc(uId)
        .collection("following")
        .doc(this.currUserId)
        .set({
          userId: uId,
        }) &&
      this.firestoreUsersRef
        .doc(this.currUserId)
        .collection("received")
        .doc(uId)
        .delete() &&
      this.firestoreUsersRef
        .doc(uId)
        .collection("sent")
        .doc(this.currUserId)
        .delete() &&
      firebase
        .firestore()
        .collection("notifications")
        .doc(this.currUserId)
        .collection("userNotifications")
        .doc(uId)
        .delete() &&
      firebase
        .firestore()
        .collection("notifications")
        .doc(uId)
        .collection("userNotifications")
        .doc("(" + this.currUserId + ")requestAccepted")
        .set({
          userId: this.currUserId,

          source: this.currUserId,
          content: "accepted your follow request",
          type: "requestAccepted",
          time: new Date().getTime(),
        }) &&
      firebase
        .firestore()
        .collection("notifications")
        .doc(this.currUserId)
        .collection("userNotifications")
        .doc(uId)
        .set({
          userId: uId,
          source: uId,
          content: "started following you",
          type: "follow",
          time: new Date().getTime(),
        });

    console.log("accepted");
    // .then(() => {
    //     this.setState({ following: true });
    //   });
  };

  handleReject = (uId) => {
    this.firestoreUsersRef
      .doc(this.currUserId)
      .collection("received")
      .doc(uId)
      .delete() &&
      this.firestoreUsersRef
        .doc(uId)
        .collection("sent")
        .doc(this.currUserId)
        .delete() &&
      firebase
        .firestore()
        .collection("notifications")
        .doc(this.currUserId)
        .collection("userNotifications")
        .doc(uId)
        .delete();
    console.log("rejected");
    // .then(() => {
    //     this.setState({ following: true });
    //   });
  };

  render() {
    return (
      <Block center style={{ marginTop: 10, height: height * 0.9 }}>
        {this.state.notifications.length == 0 && (
          // <ActivityIndicator size="large" />
          <Block
            style={{
              backgroundColor: "#ebebeb",
              borderRadius: 20,
              width: width * 0.9,
              padding: 10,
            }}
          >
            <Text> No notifications yet.</Text>
            <Text> This feature is under construction.</Text>
          </Block>
        )}

        <FlatList
          data={this.state.notifications}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          renderItem={({ item }) => (
            <NotificationItem
              navigation={this.props.navigation}
              item={item}
              handleAccept={this.handleAccept}
              handleReject={this.handleReject}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1,
  },
  profileBackground: {
    width: width,
    height: height / 2,
  },
  profileCard: {
    position: "relative",
    padding: theme.SIZES.BASE / 2,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 30,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: theme.COLORS.WHITE,

    zIndex: 2,
  },

  info: {
    paddingHorizontal: 40,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 0,
  },
  cardUser: {
    fontFamily: "Arial",
    paddingTop: 12,
    paddingLeft: 4,
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
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
});

export default connect(mapStateToProps, null)(Notifications);
