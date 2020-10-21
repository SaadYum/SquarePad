import React, { Component } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import StarRating from "react-native-star-rating";

import { SliderBox } from "react-native-image-slider-box";
import MapView, { Marker, Callout } from "react-native-maps";
import { key } from "../googleAPIKey";
import * as Permissions from "expo-permissions";

import * as Location from "expo-location";
import * as firebase from "firebase";

import {connect} from 'react-redux';

import { Button, Block, Text, theme, Icon, Input } from "galio-framework";

// import { Input } from "../components";
const { width } = Dimensions.get("screen");
const { height } = Dimensions.get("screen");
import Polyline from "@mapbox/polyline";
import getDirections from "react-native-google-maps-directions";
import { SafeAreaView } from "react-navigation";
import {
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native-gesture-handler";
import { ListItem } from "react-native-elements";
import { testAction } from "../src/actions/chatActions";



// FOR REDUX
const mapStateToProps = (state) =>{

  return{
    myChats: state.chatReducer.chats
  }
}

const mapDispatchToProps = (dispatch) =>{
  return{
    test: (data)=> dispatch(testAction(data))  
  }
}



class MyChats extends Component {
  userId = firebase.auth().currentUser.uid;

  firestoreUserRef = firebase.firestore().collection("users");
  currentUserRef = firebase.firestore().collection("users").doc(this.userId);
  firestoreUserRef = firebase.firestore().collection("users");
  storageRef = firebase.storage().ref();

  firestoreFollowingRef = firebase
    .firestore()
    .collection("users")
    .doc(this.userId)
    .collection("following");
  state = {
    followedUsers: [],
    users: [],
    foundUsers: [],
    searchTab: false,
    searchUser: "",
    searchResults: [],
    foundUser: "",
    found: false,
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
    this.getFollowedUsersData();
  };

  // Get all the users data the current user is following
  getFollowedUsersData = async () => {
    let followedUsers = this.state.followedUsers;
    let users = [];
    followedUsers.forEach(async (userId) => {
      let profilePic = this.storageRef.child(
        "profilePics/(" + userId + ")ProfilePic"
      );

      await profilePic.getDownloadURL().then(async (url) => {
        await this.firestoreUserRef
          .doc(userId)
          .get()
          .then((doc) => {
            let name = doc.data().username;

            let avatar = url;
            let push_token = doc.data().push_token;

            let userObj = {
              username: name,
              userId: userId,
              avatar: avatar,
              push_token: typeof push_token !== "undefined" ? push_token : "",
            };
            users.push(userObj);
          });
      });
      this.setState({ users: users }, console.log(this.state.users));
    });
  };

  textInput = (word) => {
    this.setState({ searchWord: word });
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
        on
        // onFocus={() => navigation.navigate('Pro')}
        onChangeText={(word) => {
          this.setState({ foundUsers: [] }, this.textInput(word));
        }}
        value={this.state.searchWord}
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

  searchUser(word) {
    let userCollectionRef = firebase.firestore().collection("users");

    let users = [];
    userCollectionRef
      .where("username", "==", word)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          let userObj = {
            userId: documentSnapshot.id,
            username: documentSnapshot.data().username,
            push_token: documentSnapshot.data().push_token,
          };
          let profilePic = this.storageRef.child(
            "profilePics/(" + documentSnapshot.id + ")ProfilePic"
          );
          profilePic.getDownloadURL().then((url) => {
            userObj.avatar = url;

            users.push(userObj);
            this.setState(
              {
                foundUsers: users,
              },
              console.log(this.state.foundUsers)
            );
          });
        });
      });
  }

  renderFoundList = () => {
    return (
      <Block
        center
        style={{
          width: width * 0.95,
          backgroundColor: "#f7f7f7",
          borderRadius: 10,
          marginTop: 5,
          height: height * 0.7,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.foundUsers &&
            this.state.foundUsers.map((u, i) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate("Chat", {
                      userId: u.userId,
                    });
                  }}
                >
                  <Block left row key={i}>
                    <ListItem
                      containerStyle={{
                        width: width * 0.77,
                        backgroundColor: "#f7f7f7",
                        borderRadius: 10,
                      }}
                      title={u.username}
                      subtitle={"Tap to chat"}
                      subtitleStyle={{ color: "grey" }}
                      leftAvatar={{ source: { uri: u.avatar } }}
                      titleStyle={{ fontSize: 20 }}
                    />

                    <Icon
                      name="message1"
                      family="AntDesign"
                      color="grey"
                      size={30}
                      style={{
                        marginTop: 20,
                        marginRight: 20,
                      }}
                    />
                  </Block>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </Block>
    );
  };
  renderMembersList = () => {
    return (
      <Block
        center
        style={{
          width: width * 0.95,
          backgroundColor: "#f7f7f7",
          borderRadius: 10,
          marginTop: 5,
          height: height * 0.7,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.users &&
            this.state.users.map((u, i) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate("Chat", {
                      userId: u.userId,
                    });
                  }}
                  key={i}
                >
                  <Block left row>
                    <ListItem
                      containerStyle={{
                        width: width * 0.77,
                        backgroundColor: "#f7f7f7",
                        borderRadius: 10,
                      }}
                      title={u.username}
                      subtitle={"Tap to chat"}
                      subtitleStyle={{ color: "grey" }}
                      leftAvatar={{ source: { uri: u.avatar } }}
                      titleStyle={{ fontSize: 20 }}
                    />

                    <Icon
                      name="message1"
                      family="AntDesign"
                      color="grey"
                      size={30}
                      style={{
                        marginTop: 20,
                        marginRight: 20,
                      }}
                    />
                  </Block>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </Block>
    );
  };

  UNSAFE_componentWillMount = () => {
    this.getFollowedUsers();
  };

  componentDidMount = () => {};

  render() {
    return (
      <Block flex center style={styles.home}>
        <Block row center flex={1}>
          <TouchableOpacity
            style={{
              width: width * 0.5,
              alignItems: "center",
              height: 50,
              borderRightColor: "#f5f5f5",
              backgroundColor: !this.state.searchTab ? "#f5f5f5" : "white",
              borderRightWidth: 2,
              //   backgroundColor: "grey",
            }}
            onPress={() => this.setState({ searchTab: false })}
          >
            <Text h5 style={{ paddingVertical: 15 }}>
              Following
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: width * 0.5,
              height: 50,
              alignItems: "center",
              backgroundColor: this.state.searchTab ? "#f5f5f5" : "white",
            }}
            onPress={() => this.setState({ searchTab: true })}
          >
            <Text h5 style={{ paddingVertical: 15 }}>
              Search
            </Text>
          </TouchableOpacity>
        </Block>

        <Block flex={9}>
          {this.state.searchTab && this.renderSearchBar()}
          {this.state.searchTab && this.renderFoundList()}
          {!this.state.searchTab && this.renderMembersList()}
        </Block>
      </Block>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps) (MyChats);

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    justifyContent: "center",
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
    height: Dimensions.get("window").height * 0.3,
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
});

