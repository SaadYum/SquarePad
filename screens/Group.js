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
  Platform,
} from "react-native";
import { Block, theme, Text, Input } from "galio-framework";
import PlanCard from "../components/PlanCard";

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

class Group extends React.Component {
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
    joinSpinner: false,
    joining: false,
    discussion: [],
    country: "uk",
    foundGroups: [],
    myGroups: [],
    searchWord: "",
    searching: false,
    refreshing: false,
    myGroupsTab: true,
    suggestedTab: false,
    currentMember: {},
    isMember: false,
    members: [],
    memberIds: [],
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
        postId: "aEutLSN8lWRaL",
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
        postId: "aEut",
        timeStamp: {
          nanoseconds: 872000000,
          seconds: 1580802544,
        },
        title: "post",
        userId: "niKoNaL9NeOPx7iW4jDUi5Cqyht2",
        username: "Saad_Rehman",
      },
    ],
    groups: [
      { id: 1, title: "Group Title", photo: Images.groupFiller },
      { id: 2, title: "Group Title", photo: Images.groupFiller },
      { id: 3, title: "Group Title", photo: Images.groupFiller },
      { id: 4, title: "Group Title", photo: Images.groupFiller },
      { id: 5, title: "Group Title", photo: Images.groupFiller },
      { id: 6, title: "Group Title", photo: Images.groupFiller },
      { id: 7, title: "Group Title", photo: Images.groupFiller },
      { id: 8, title: "Group Title", photo: Images.groupFiller },
    ],
  };

  textInput = (word) => {
    this.setState({ searchWord: word });
    this.searchGroups(word);
  };

  addChoice = async () => {
    const selection = await new Promise((resolve) => {
      const title = "Add!";
      const message = "Select one";
      const buttons = [
        { text: "Post", onPress: () => resolve("Post") },
        { text: "Plan", onPress: () => resolve("Plan") },
        { text: "Cancel", onPress: () => resolve(null) },
      ];
      Alert.alert(title, message, buttons);
    });

    if (selection == "Post") {
      this.props.navigation.navigate("SharePost", { group: this.state.group });
    } else if (selection == "Plan") {
      this.props.navigation.navigate("SharePlan", { group: this.state.group });
    }
  };

  renderAddPost = () => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "#efefef",
          width: width * 0.3,
          height: 35,
          alignItems: "center",
          borderRadius: 15,
          marginLeft: 50,
        }}
        onPressIn={this.addChoice}
      >
        <Block row style={{ marginTop: 5, left: 2 }}>
          <Text h5 color="grey">
            Add
          </Text>
          <Icon
            style={{ marginLeft: 5, paddingVertical: 1 }}
            size={20}
            color={"grey"}
            name="plus"
            family="AntDesign"
          />
        </Block>
      </TouchableOpacity>
    );
  };

  joinGroup = () => {
    this.setState({ joining: true });
    let group = this.state.group;
    let members = this.state.members;
    let memberIds = this.state.memberIds;
    let currentMember = this.state.currentMember;

    members.push(currentMember);
    memberIds.push(currentMember.id);
    console.log(members, memberIds, currentMember);
    // console.log();
    firebase
      .firestore()
      .collection("groups")
      .doc(group.groupId)
      .set(
        {
          members: members,
          memberIds: memberIds,
        },
        { merge: true }
      )
      .then(() => {
        alert("Joined");
        this.setState({ joining: false });
      })
      .catch((err) => alert(err));
  };

  getCurrentMember = async () => {
    let profilePic = firebase
      .storage()
      .ref()
      .child("profilePics/(" + this.user.uid + ")ProfilePic");

    await profilePic.getDownloadURL().then(async (url) => {
      await firebase
        .firestore()
        .collection("users")
        .doc(this.user.uid)
        .get()
        .then((doc) => {
          let currentMember = {
            id: this.user.uid,
            name: doc.data().username,
            avatar: url,
            push_token: doc.data().push_token,
          };
          this.setState({ currentMember: currentMember });
        });
    });
  };

  renderJoinButton = () => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "#efefef",
          width: width * 0.3,
          height: 35,
          alignItems: "center",
          borderRadius: 15,
          marginLeft: 50,
        }}
        onPressIn={this.joinGroup}
      >
        <Block row style={{ marginTop: 5, left: 2 }}>
          <Text h5 color="grey">
            Join
          </Text>
          <Icon
            style={{ marginLeft: 5, paddingVertical: 1 }}
            size={20}
            color={"grey"}
            name="plus"
            family="AntDesign"
          />
        </Block>
      </TouchableOpacity>
    );
  };

  renderGroupDiscussion = () => {
    let myGroups = this.state.myGroups;

    return (
      <Block flex center style={styles.home}>
        <Block
          row
          style={{ marginTop: 10, zIndex: 2, alignSelf: "flex-start" }}
        >
          <Text h3 color="grey" style={{ left: 20 }}>
            Discussion
          </Text>
          {this.state.isMember ? this.renderAddPost() : this.renderJoinButton()}
          <Block right style={{ left: 20, top: 2 }}>
            <TouchableOpacity onPressIn={this.chooseOptions}>
              <Icon
                family="Entypo"
                size={28}
                name="dots-three-vertical"
                color={"grey"}
              />
            </TouchableOpacity>
          </Block>
        </Block>

        <Block
          center
          style={{
            marginTop: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#ebebeb",
            width: width,
            backgroundColor: "#ebebeb",

            zIndex: 2,
          }}
        />
        <Block style={{ marginTop: 10, marginBottom: 120, zIndex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            // onScrollEndDrag={}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
            data={this.state.discussion}
            renderItem={({ item }) =>
              item.title == "post" ? (
                <Card item={item} group groupId={this.state.group.groupId} />
              ) : (
                <PlanCard
                  width={width * 1.85}
                  item={item.plan}
                  join
                  onJoinStart={() => {
                    this.setState({ joinSpinner: true });
                  }}
                  onJoinEnd={(msg) => {
                    Alert.alert(
                      "Alert",
                      msg,
                      [
                        {
                          text: "OK",
                          onPress: () => this.setState({ joinSpinner: false }),
                        },
                      ],
                      { cancelable: false }
                    );
                  }}
                  groupId={this.state.group.groupId}
                  user={this.state.currentMember}
                />
              )
            }
            keyExtractor={(item) => item.postId}
            horizontal={false}
            // numColumns={2}
          />
        </Block>
      </Block>
    );
  };

  isMember = () => {
    let group = this.state.group;
    let memberIds = [];
    if (this.user.uid == group.creatorId) {
      this.setState({ isMember: true });
      return;
    } else {
      firebase
        .firestore()
        .collection("groups")
        .doc(group.groupId)
        .onSnapshot((doc) => {
          this.setState({
            memberIds: doc.data().memberIds,
            members: doc.data().members,
          });
          memberIds = doc.data().memberIds;
          if (memberIds.includes(this.user.uid)) {
            this.setState({ isMember: true });
          } else {
            this.setState({ isMember: false });
          }
        });
    }
  };

  getDiscussion = () => {
    let discussion = [];
    let groupId = this.state.group.groupId;
    console.log(groupId);
    firebase
      .firestore()
      .collection("groups")
      .doc(groupId)
      .collection("discussion")
      .onSnapshot((docs) => {
        docs.forEach((doc) => {
          discussion.push(doc.data());
        });
        this.setState({ discussion: discussion });
      });
  };

  UNSAFE_componentWillMount = () => {
    this.isMember();
    this.getCurrentMember();
  };
  componentDidMount = () => {
    this.getDiscussion();
  };

  onRefresh = () => {
    this.setState({ refreshing: true });

    this.getDiscussion();
    this.setState({ refreshing: false });
  };

  chooseOptions = async () => {
    const selection = await new Promise((resolve) => {
      const title = "Options!";
      const message = "";
      const buttons = [
        { text: "Edit Group", onPress: () => resolve("Edit") },
        { text: "Delete Group", onPress: () => resolve("Delete") },
        { text: "Cancel", onPress: () => resolve(null) },
      ];
      Alert.alert(title, message, buttons);
    });

    if (selection == "Edit") {
      this.props.navigation.navigate("EditGroup", { group: this.state.group });
    } else if (selection == "Delete") {
      const delSelection = await new Promise((resolve) => {
        const deltitle = "Delete";
        const delmessage = "Are you sure?";
        const delbuttons = [
          { text: "Delete", onPress: () => resolve("Delete") },
          { text: "Cancel", onPress: () => resolve(null) },
        ];
        Alert.alert(deltitle, delmessage, delbuttons);
      });

      if (delSelection == "Delete") {
        this.setState({ spinner: true });
        firebase
          .firestore()
          .collection("groups")
          .doc(this.state.group.groupId)
          .delete()
          .then(() => {
            this.setState({ spinner: false });
            alert("Group Deleted!");
            this.props.navigation.goBack();
          });
      }
    } else {
      return;
    }
  };

  render() {
    return (
      <Block>
        {/* <Image source ={{}}/> */}
        <ImageBackground
          source={
            this.state.group.groupPhoto != ""
              ? { uri: this.state.group.groupPhoto }
              : Images.groupsMain
          }
          style={styles.profileContainer}
          imageStyle={styles.profileBackground}
        >
          <Spinner
            visible={this.state.spinner}
            textContent={"Creating.."}
            textStyle={{ color: "#FFF" }}
          />
          <Spinner
            visible={this.state.joining}
            textContent={"Joining.."}
            textStyle={{ color: "#FFF" }}
          />
          <Spinner
            visible={this.state.joinSpinner}
            textContent={"Sending Request.."}
            textStyle={{ color: "#FFF" }}
          />
          {Platform.OS == "android" && (
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
          )}
          <Block flex left center style={{ marginTop: 80 }}>
            <Block row>
              {this.state.group.groupTitle.length < 12 && (
                <Block row>
                  <Text
                    h2
                    color="#ebebeb"
                    style={{ alignSelf: "flex-start", left: 10 }}
                  >
                    {this.state.group.groupTitle}
                  </Text>

                  <Icon
                    family="Entypo"
                    style={{ left: 80 }}
                    size={40}
                    color={"#ebebeb"}
                    name="users"
                  />
                  <Text
                    h2
                    color="#ebebeb"
                    style={{ alignSelf: "flex-end", left: 90 }}
                  >
                    {this.state.group.members
                      ? this.state.group.members.length
                      : 0}
                  </Text>
                </Block>
              )}
              {this.state.group.groupTitle.length > 11 && (
                <Text
                  h3
                  color="#ebebeb"
                  style={{ alignSelf: "flex-start", left: 10 }}
                >
                  {this.state.group.groupTitle}
                </Text>
              )}
            </Block>
            {this.renderGroupDiscussion()}
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
});

export default Group;
