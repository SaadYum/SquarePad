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
import Spinner from "react-native-loading-spinner-overlay";

import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { getPosts } from "../constants/Images";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

class PlanJoinRequests extends React.Component {
  user = firebase.auth().currentUser;
  //   firestoreUserRef = firebase.firestore().collection("users").doc(this.user.uid);
  //   firestorePostRef = firebase.firestore().collection("posts").doc(this.user.uid)
  //   .collection("userPosts");
  storageRef = firebase.storage().ref();

  state = {
    searchWord: "",
    spinner: false,
    searchResults: [],
    profilePic: Images.ProfilePicture,
    foundUser: "",
    found: false,
    push_token: "",
    members: this.props.navigation.getParam("plan").members,
    plan: this.props.navigation.getParam("plan"),
    joinRequests: [],
  };

  renderAvatar = () => {
    const { avatar, item } = this.props;
    // if (!item.avatar) return null;
    return (
      <Image source={{ uri: this.state.profilePic }} style={styles.avatar} />
    );
  };

  renderMemberItem = (name, avatar) => {
    return (
      <Block>
        <Block row>
          <Block left row>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <Text>{name}</Text>
          </Block>
          <Block right>
            <TouchableOpacity>
              <Icon
                size={16}
                color="red"
                name="minuscircle"
                family="AntDesign"
              />
            </TouchableOpacity>
          </Block>
        </Block>
        <Block style={{ borderBottomColor: "black", borderBottomWidth: 1 }} />
      </Block>
    );
  };

  deleteFromRequest = (user) => {
    firebase
      .firestore()
      .collection("plans")
      .doc(this.user.uid)
      .collection("userPlans")
      .doc(this.state.plan.id)
      .collection("joinRequests")
      .doc(user.userId)
      .delete()
      .then(() => {
        Alert.alert(
          "Alert",
          "Done!",
          [
            {
              text: "OK",
              onPress: () => this.setState({ spinner: false }),
            },
          ],
          { cancelable: false }
        );
      });
  };

  acceptRequest = (user) => {
    let planId = this.state.plan.id;
    let members = this.state.plan.members;
    this.setState({ spinner: true });
    members.push(user);

    firebase
      .firestore()
      .collection("plans")
      .doc(this.user.uid)
      .collection("userPlans")
      .doc(planId)
      .set(
        {
          members: members,
        },
        { merge: true }
      )
      .then(() => {
        this.deleteFromRequest(user);
      });
  };

  renderMembersList = () => {
    const { params } = this.props.navigation.state;

    // const {name, avatar} = this.props;
    return (
      <SafeAreaView>
        <Block
          center
          style={{
            width: width * 0.8,
            backgroundColor: "#f5f5f5",
            borderRadius: 20,
            top: 20,
          }}
        >
          {this.state.joinRequests.length == 0 && (
            <Text h5>No Pending Requests</Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {this.state.joinRequests &&
              this.state.joinRequests.map((u, i) => {
                if (u.userId != this.user.uid) {
                  return (
                    <Block left row key={i}>
                      <ListItem
                        containerStyle={{
                          width: width * 0.7,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 20,
                        }}
                        title={u.name}
                        leftAvatar={{ source: { uri: u.avatar } }}
                      />
                      <Button
                        onlyIcon
                        icon="check"
                        iconFamily="antdesign"
                        iconSize={35}
                        color="#f5f5f5"
                        iconColor="grey"
                        style={{
                          width: 40,
                          right: 20,
                          height: 45,
                          marginTop: 12,
                        }}
                        onPress={() => {
                          this.acceptRequest(u);
                        }}
                      ></Button>
                    </Block>
                  );
                }
              })}
          </ScrollView>
        </Block>
      </SafeAreaView>
    );
  };

  getJoinRequests = () => {
    let joinRequests = [];
    firebase
      .firestore()
      .collection("plans")
      .doc(this.user.uid)
      .collection("userPlans")
      .doc(this.state.plan.id)
      .collection("joinRequests")
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          joinRequests.push(doc.data());
          this.setState({ joinRequests: joinRequests });
        });
      });
  };
  UNSAFE_componentWillMount = () => {
    this.getJoinRequests();
  };

  render() {
    return (
      <Block>
        <Block center style={{ top: 10 }}>
          <Text h3>Join Requests</Text>
          <Spinner
            visible={this.state.spinner}
            textContent={"Wait.."}
            textStyle={{ color: "#FFF" }}
          />
        </Block>
        <Block>{this.renderMembersList()}</Block>
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

export default PlanJoinRequests;
