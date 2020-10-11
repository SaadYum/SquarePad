import React from "react";
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
  return (
    <TouchableOpacity
      style={{
        marginHorizontal: 10,
        marginTop: 5,
        borderRadius: 15,
        backgroundColor: "#f5f5f5",
      }}
      onPress={() => {
        let type = props.type;

        switch (type) {
          case "comment":
            getPost(item.postId, item.postUserId).then((post) => {
              props.navigation.navigate("NotificationPost", {
                username: post.username,
                title: "",
                avatar: post.avatar,
                image: post.image,
                cta: "View article",
                caption: post.caption,
                location: post.location.locationName,
                postId: post.postId,
                userId: post.userId,
              });
            });
            break;
          case "planRequest":
            onPlanRequest(props);
            break;
          case "plan":
            props.navigation.navigate("NotificationPlans");
            break;
          case "groupInvitation":
            onGroupInvitation(props);
          default:
            break;
        }
      }}
    >
      <Block>
        <Block>
          <Text
            h5
            style={{ marginTop: 10, marginHorizontal: 10, marginBottom: 7 }}
          >
            {props.title}
          </Text>
          <Text style={{ marginBottom: 15, marginHorizontal: 10 }}>
            {props.content}
          </Text>
        </Block>
      </Block>
    </TouchableOpacity>
  );
};

class Notifications extends React.Component {
  user = firebase.auth().currentUser;

  constructor(props) {
    super(props);
    //does whatever stuff
    this.state = {
      notifications: [],
      refreshing: false,
    };

    this.joinPlan = this.joinPlan.bind(this);
    this.rejectPlan = this.rejectPlan.bind(this);
  }
  firestoreNotificationRef = firebase
    .firestore()
    .collection("notifications")
    .doc(this.user.uid)
    .collection("userNotifications");

  storageRef = firebase.storage().ref();

  renderAvatar = () => {
    const { avatar, item } = this.props;
    return (
      <Image source={{ uri: this.state.profilePic }} style={styles.avatar} />
    );
  };

  joinPlan = (notification) => {
    let members = [];
    let currentMember;
    let wholePlan;
    firebase
      .firestore()
      .collection("plans")
      .doc(notification.creatorId)
      .collection("userPlans")
      .doc(notification.planId)
      .get()
      .then((doc) => {
        members = doc.data().members;
        wholePlan = doc.data();
        currentMember = members.find(
          (member) => member.userId == this.user.uid
        ); // current member that we'll update
        currentMember.planRequest = true; //change we made
        members = members.filter((member) => member.userId != this.user.uid); // members without current
        members.push(currentMember);
      })
      .then(() => {
        firebase
          .firestore()
          .collection("plans")
          .doc(notification.creatorId)
          .collection("userPlans")
          .doc(notification.planId)
          .set(
            {
              members: members,
            },
            { merge: true }
          )
          .then(() => {
            firebase
              .firestore()
              .collection("plans")
              .doc(this.user.uid)
              .collection("invitedPlans")
              .doc(notification.planId)
              .set({
                creatorId: wholePlan.creatorId,
                planId: notification.planId,
                // creatorId: wholePlan.creatorId,
                // creatorName: wholePlan.creatorName,
                // members: members, // our new variable
                // todos: wholePlan.todos,
                // spots: wholePlan.spots,
                // destination: wholePlan.destination,
                // destination_id: wholePlan.destination_id,
                // location: wholePlan.location,
                // startDate: wholePlan.startDate,
                // endDate: wholePlan.endDate,
                // dateCreated: wholePlan.dateCreated,
                // photos: wholePlan.photos,
                // destinationTypes: wholePlan.destinationTypes,
                // status: "ongoing",
              })
              .catch((err) => alert("Error Adding Plan!"));
            this.firestoreNotificationRef
              .doc(notification.id)
              .delete()
              .catch((err) => alert(err));
          });
      });

    props.navigation.navigate("NotificationPlans");
  };

  rejectPlan = (notification) => {
    let members = [];
    let currentMember;
    let wholePlan;
    firebase
      .firestore()
      .collection("plans")
      .doc(notification.creatorId)
      .collection("userPlans")
      .doc(notification.planId)
      .get()
      .then((doc) => {
        members = doc.data().members;
        wholePlan = doc.data();
        members = members.filter((member) => member.userId != this.user.uid); // members without current
      })
      .then(() => {
        firebase
          .firestore()
          .collection("plans")
          .doc(notification.creatorId)
          .collection("userPlans")
          .doc(notification.planId)
          .set(
            {
              members: members,
            },
            { merge: true }
          )
          .then(() => {
            this.firestoreNotificationRef
              .doc(notification.id)
              .delete()
              .catch((err) => alert(err));
          });
      });
  };

  getNotifications = () => {
    let toDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 7 Days back date

    console.log("jsfjkfbjafjasfj");
    let lastWeekTimeStamp = firebase.firestore.Timestamp.fromDate(toDate);
    let notifications = [];
    this.firestoreNotificationRef
      .where("time", ">=", lastWeekTimeStamp)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          let notificationObj = doc.data();
          notificationObj.id = doc.id;
          notifications.push(notificationObj);
        });
        this.setState(
          { notifications: notifications, refreshing: false },
          () => {
            notifications = [];
            console.log("notifications added", notifications);
          }
        );
      });
  };

  UNSAFE_componentWillMount = () => {
    this.getNotifications();
  };

  onRefresh = () => {
    this.setState({ refreshing: true });

    this.getNotifications();
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
              // width: width * 0.7,
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
          renderItem={({ item }) =>
            item.type == "comment" ? (
              <NotificationItem
                navigation={this.props.navigation}
                item={item}
                type={item.type}
                title={item.user}
                content={item.content}
                joinPlan={this.joinPlan}
                rejectPlan={this.rejectPlan}
              />
            ) : item.type == "planRequest" ? (
              <NotificationItem
                item={item}
                navigation={this.props.navigation}
                type={item.type}
                title={"Plan Request"}
                content={item.content}
                joinPlan={this.joinPlan}
                rejectPlan={this.rejectPlan}
              />
            ) : item.type == "plan" ? (
              <NotificationItem
                item={item}
                navigation={this.props.navigation}
                type={item.type}
                title={"Recommended Plan"}
                content={item.content}
                joinPlan={this.joinPlan}
                rejectPlan={this.rejectPlan}
              />
            ) : (
              <NotificationItem
                item={item}
                navigation={this.props.navigation}
                type={item.type}
                title={"Group Invitation"}
                content={item.content}
                group={item.group}
              />
            )
          }
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

export default Notifications;
