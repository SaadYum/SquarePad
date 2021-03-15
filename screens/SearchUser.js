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
  KeyboardAvoidingView,
} from "react-native";
import { Block, Text, theme } from "galio-framework";

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
} from "react-native-gesture-handler";
import { getPosts } from "../constants/Images";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

class SearchUser extends React.Component {
  //   user = firebase.auth().currentUser;
  //   firestoreUserRef = firebase.firestore().collection("users").doc(this.user.uid);
  //   firestorePostRef = firebase.firestore().collection("posts").doc(this.user.uid)
  //   .collection("userPosts");
  storageRef = firebase.storage().ref();
  user = firebase.auth().currentUser;

  state = {
    searchWord: "",
    searchResults: [],
    profilePic: Images.ProfilePicture,
    foundUser: "",
    found: false,
  };
  searchUser(word) {
    let userCollectionRef = firebase.firestore().collection("users");
    let sWord = word.toLowerCase();
    let users = [];
    userCollectionRef
      .where("usernameKeywords", "array-contains", sWord)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          if (documentSnapshot.id != this.user.uid) {
            let userObj = documentSnapshot.data();
            userObj.userId = documentSnapshot.id;
            users.push(userObj);
          }
        });
      })
      .then(() => {
        if (users.length == 0) {
          this.setState({
            profilePic: Images.ProfilePicture,
            searchResults: [],
            foundUser: "",
            found: false,
          });
        } else {
          this.setState({ searchResults: users, found: true }, () => {
            console.log(this.state.searchResults);
          });
        }
      });
  }

  renderAvatar = (profilePic) => {
    return <Image source={{ uri: profilePic }} style={styles.avatar} />;
  };

  renderUserItem = () => {
    const { navigation } = this.props;

    return (
      <>
        <Block
          style={{
            flex: 1,
            paddingLeft: 6,
            marginHorizontal: 16,
            paddingBottom: 12,
            paddingTop: 12,
            backgroundColor: "#ebebeb",
            borderRadius: 20,
          }}
        >
          {this.state.searchResults.map((user) => (
            <Block row style={{ margin: "2%" }}>
              <Block>
                <TouchableWithoutFeedback
                  onPress={() =>
                    navigation.navigate("searchUserProfile", {
                      userId: user.userId,
                    })
                  }
                >
                  {this.renderAvatar(user.profilePic)}
                </TouchableWithoutFeedback>
              </Block>
              <Block>
                <TouchableWithoutFeedback
                  onPress={() =>
                    navigation.navigate("searchUserProfile", {
                      userId: user.userId,
                    })
                  }
                >
                  <Text size={20} style={styles.cardUser}>
                    {user.username}
                  </Text>
                </TouchableWithoutFeedback>
              </Block>
            </Block>
          ))}
        </Block>
      </>
    );
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

  render() {
    return (
      <Block>
        <Block>{this.renderSearchBar()}</Block>
        <ScrollView
          showsVerticalScrollIndicator={false}
          // style = {styles.article}
        >
          <Block>{this.renderUserItem()}</Block>
        </ScrollView>
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

export default SearchUser;
