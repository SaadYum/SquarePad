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
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { Block, Icon, Input, Text, theme } from "galio-framework";

import { Button } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import * as firebase from "firebase";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";

import Constants from "expo-constants";
import { logOut } from "../services/auth.service";
// import { getPosts } from "../constants/Images";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  // console.log("YESS", state)
  return {
    chats: state.chatReducer.chats,
    users: state.chatReducer.users,
    followedUsers: state.chatReducer.followedUsers,
    followers: state.chatReducer.followers,
  };
};

class MyFollowing extends React.Component {
  state = {
    followings: [],
    currUser: "",
    searchWord: "",
    filteredFollowedUsers: [],
  };
  componentDidMount = () => {
    this.getfollowings();
  };

  getfollowings = () => {
    let followings = [];

    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("following")
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          firebase
            .firestore()
            .collection("users")
            .doc(doc.id)
            .get()
            .then((doc) => {
              let userObj = {
                userId: doc.id,
                profilePic:
                  typeof doc.data().profilePic != "undefined"
                    ? doc.data().profilePic
                    : Images.ProfilePicture,
                username: doc.data().username,
              };

              followings.push(userObj);
              this.setState({ followings: followings });
            });
        });
      })
      .catch((err) => alert(err));
  };

  searchUser = (word) => {
    this.setState({ filteredFollowedUsers: [] });
    let followedUsers = this.props.followedUsers;
    let filtered = followedUsers.filter((follower) =>
      follower.username.includes(word)
    );
    filtered = followedUsers.filter((follower) =>
      follower.name.toLowerCase().includes(word)
    );
    this.setState({ filteredFollowedUsers: filtered });
  };

  textInput = (word) => {
    this.setState({ searchWord: word });
    this.searchUser(word.toLowerCase());
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

  renderUserItem = (following) => {
    const { navigation } = this.props;
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("followingProfile", {
            userId: following.userId,
          })
        }
      >
        <Block
          row
          style={{
            // paddingLeft: 6,
            marginHorizontal: 16,
            paddingBottom: 12,
            paddingTop: 12,
            backgroundColor: "whitesmoke",
            borderRadius: 20,
            borderBottomWidth: 2,
            borderBottomColor: "#ffffff",
          }}
        >
          <Block row>
            <Image source={{ uri: following.avatar }} style={styles.avatar} />

            <Text size={20} style={styles.cardUser}>
              {following.username}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  };

  renderfollowings = () => {
    return (
      <Block
        style={{
          // flex: 1,
          paddingLeft: 6,
          marginHorizontal: 16,
          paddingBottom: 12,
          paddingTop: 12,
          backgroundColor: "whitesmoke",
          borderRadius: 20,
          height: height * 0.68,
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          // onScrollEndDrag={this.getNextPosts}
          // refreshControl={
          //   <RefreshControl
          //   refreshing={this.state.refreshing}
          //   onRefresh={this.onRefresh}
          //   />
          // }
          data={
            this.state.searchWord == ""
              ? this.props.followedUsers
              : this.state.filteredFollowedUsers
          }
          renderItem={({ item }) => this.renderUserItem(item)}
          keyExtractor={(item) => item.userId}
        />
      </Block>
    );
  };

  render() {
    let followings = this.props.followedUsers;
    // console.log(followings);
    return (
      <>
        <Block style={{ marginTop: 10 }}>{this.renderSearchBar()}</Block>

        <Block style={{ marginTop: 10 }}>
          {followings.length > 0 ? (
            this.renderfollowings()
          ) : (
            <Block
              middle
              style={{
                marginHorizontal: 16,
                paddingBottom: 12,
                paddingTop: 12,
                backgroundColor: "#ebebeb",
                borderRadius: 20,
              }}
            >
              <Text>No followings</Text>
            </Block>
          )}
        </Block>
      </>
    );
  }
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0,
  },
  cardUser: {
    // fontFamily: "Arial",
    paddingTop: 8,
    paddingLeft: 4,
    color: theme.COLORS.BLACK,
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

export default connect(mapStateToProps, null)(MyFollowing);
