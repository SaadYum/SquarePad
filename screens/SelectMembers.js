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
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { getPosts } from "../constants/Images";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

class SelectMembers extends React.Component {
  //   user = firebase.auth().currentUser;
  //   firestoreUserRef = firebase.firestore().collection("users").doc(this.user.uid);
  //   firestorePostRef = firebase.firestore().collection("posts").doc(this.user.uid)
  //   .collection("userPosts");
  user = firebase.auth().currentUser;

  firestorePlansRef = firebase
    .firestore()
    .collection("plans")
    .doc(this.user.uid)
    .collection("userPlans");

  storageRef = firebase.storage().ref();
  firestoreFollowingRef = firebase
    .firestore()
    .collection("following")
    .doc(this.user.uid)
    .collection("userFollowing");

  state = {
    searchWord: "",
    searchResults: [],
    profilePic: Images.ProfilePicture,
    foundUser: "",
    found: false,
    push_token: "",
    followedUsers: [],
    // members:[
    //     {name: "Saad", avatar: Images.ProfilePicture},
    //     {name: "Saad1", avatar: Images.ProfilePicture},
    //     {name: "Saad2", avatar: Images.ProfilePicture},
    //     {name: "Saad3", avatar: Images.ProfilePicture},
    //     {name: "Saad4", avatar: Images.ProfilePicture}]
    members: [],
    creatorName: "",
  };

  searchUser(word) {
    let userCollectionRef = firebase.firestore().collection("users");

    let users = [];
    userCollectionRef
      .where("username", "==", word)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          if (documentSnapshot.id != this.user.uid) {
            //check if following
            let found = this.state.followedUsers.find(
              (userId) => userId == documentSnapshot.id
            );
            if (found) {
              users.push(documentSnapshot.data());
              //   console.log(documentSnapshot.id);
              this.setState({
                foundUser: documentSnapshot.id,
                push_token: documentSnapshot.data().push_token,
                found: true,
              });
            }
          }
          // console.log(this.state.foundUser)
          // console.log(users);
        });
        // console.log(this.state.searchResults);
        // console.log(this.state.foundUser);

        if (users.length == 0) {
          this.setState({
            profilePic: Images.ProfilePicture,
            searchResults: [],
            foundUser: "",
            found: false,
          });
        } else {
          let profilePic = this.storageRef.child(
            "profilePics/(" + this.state.foundUser + ")ProfilePic"
          );
          profilePic.getDownloadURL().then((url) => {
            this.setState({ profilePic: url });
          });
          this.setState({ searchResults: users });
          // console.log(this.state.searchResults);
        }
      });
  }

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

  removeMember = (name) => {
    const memberIndex = this.state.members.findIndex(
      (item) => item.name == name
    );

    let membersCopy = this.state.members;

    // Splice used so that content remains intent
    if (memberIndex > -1) {
      membersCopy.splice(memberIndex, 1);
    }
    this.setState({
      members: membersCopy,
    });
    // console.log(this.state.members)
  };

  addMember = () => {
    let name = this.state.searchWord;
    let userId = this.state.foundUser;
    let avatar = this.state.profilePic;
    let push_token = this.state.push_token;

    let member = {
      userId: userId,
      name: name,
      avatar: avatar,
      push_token: push_token,
      planRequest: false,
    };
    let allMembers = this.state.members;
    allMembers = allMembers.filter(
      (pmember) => pmember.userId != member.userId
    );
    allMembers.push(member);

    this.setState({
      members: allMembers,
      searchWord: "",
      found: false,
      searchResults: [],
    });

    console.log(allMembers);
  };

  addMeAsMember = () => {
    let name;
    let userId;
    let avatar;
    let push_token;

    let profilePic = this.storageRef.child(
      "profilePics/(" + this.user.uid + ")ProfilePic"
    );

    profilePic
      .getDownloadURL()
      .then((url) => {
        avatar = url;
      })
      .then(() => {
        firebase
          .firestore()
          .collection("users")
          .doc(this.user.uid)
          .get()
          .then((doc) => {
            name = doc.data().username;
            push_token = doc.data().push_token;

            userId = this.user.uid;

            let member = {
              userId: userId,
              name: name,
              avatar: avatar,
              planRequest: true,
              push_token: push_token,
            };
            let allMembers = this.state.members;
            allMembers = allMembers.filter(
              (pmember) => pmember.userId != member.userId
            );
            allMembers.push(member);

            this.setState({
              members: allMembers,
              searchWord: "",
              found: false,
              searchResults: [],
            });

            console.log(allMembers);
          });
      });
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
            <TouchableOpacity onPress={this.removeMember(name)}>
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

  renderMembersList = () => {
    const { params } = this.props.navigation.state;

    // const {name, avatar} = this.props;
    return (
      <Block
        center
        shadow
        style={{
          width: width * 0.9,
          backgroundColor: "#f5f5f5",
          borderRadius: 5,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.members &&
            this.state.members.map((u, i) => {
              if (u.userId != this.user.uid) {
                return (
                  <Block left row key={i}>
                    <ListItem
                      containerStyle={{
                        width: width * 0.7,
                        backgroundColor: "#f5f5f5",
                      }}
                      title={u.name}
                      leftAvatar={{ source: { uri: u.avatar } }}
                    />
                    <Button
                      onlyIcon
                      icon="minuscircle"
                      iconFamily="antdesign"
                      iconSize={25}
                      color="#f5f5f5"
                      iconColor="#fff"
                      style={{ width: 40, height: 40, marginTop: 10 }}
                      onPress={() => {
                        this.removeMember(u.name);
                      }}
                    ></Button>
                  </Block>
                );
              }
            })}
        </ScrollView>
        {this.state.members.length > 1 && (
          <Block style={{ margin: 10 }}>
            <Button
              round
              size="small"
              color="tomato"
              onPress={() => {
                // params.updateMembers(this.state.members);
                //     this.props.navigation.navigate("RecommendedPlan",{
                //         members: this.state.members,
                //         place_id: this.props.navigation.getParam('place_id'),
                //         types: this.props.navigation.getParam('types'),
                //         name: this.props.navigation.getParam('name'),
                //         images: this.props.navigation.getParam('images'),
                //         location: this.props.navigation.getParam('location'),
                //         startDate: this.props.navigation.getParam('startDate'),
                //         endDate: this.props.navigation.getParam('endDate'),
                //         dateCreated: this.props.navigation.getParam('dateCreated')
                // });
                this.initiatePlan();
                alert(
                  "This will take a while. We'll notify you when plan is ready!"
                );
                this.props.navigation.popToTop();
              }}
            >
              Generate
            </Button>
          </Block>
        )}
      </Block>

      //    <Card containerStyle={{padding: 0, backgroundColor:"black"}} >
      //     {
      //       this.state.users.map((u, i) => {
      //         return (
      //           <ListItem
      //             key={i}
      //             title={u.name}
      //             leftAvatar={{source: {uri : u.avatar}}}
      //           />
      //         );
      //       })
      //     }
      //   </Card>
    );
  };

  renderUserItem = () => {
    const { navigation } = this.props;
    if (this.state.found) {
      return (
        <Block
          shadow
          row
          flex
          style={{
            paddingHorizontal: 6,
            marginHorizontal: 16,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: "#f7f7f7",
            borderRadius: 20,
            borderColor: "#f7f7f7",
            borderWidth: 0,
            marginVertical: 12,
          }}
        >
          <Block row left flex={2}>
            <Block>
              <TouchableWithoutFeedback
                onPress={() =>
                  navigation.navigate("userProfile", {
                    userId: this.state.foundUser,
                  })
                }
              >
                {this.renderAvatar()}
              </TouchableWithoutFeedback>
            </Block>
            <Block>
              <TouchableWithoutFeedback
                onPress={() =>
                  navigation.navigate("userProfile", {
                    userId: this.state.foundUser,
                  })
                }
              >
                <Text size={25} style={styles.cardUser}>
                  {this.state.searchWord}
                </Text>
              </TouchableWithoutFeedback>
            </Block>
          </Block>
          <Block right flex={1} styles={{ marginTop: 30, marginRight: 50 }}>
            <Button
              onlyIcon
              icon="plus"
              iconFamily="antdesign"
              iconSize={30}
              color="tomato"
              iconColor="#fff"
              style={{ width: 50, height: 50 }}
              onPress={this.addMember}
            ></Button>
          </Block>
        </Block>
      );
    }
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

  UNSAFE_componentWillMount = () => {
    this.addMeAsMember();

    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .get()
      .then((snap) => {
        this.setState({ creatorName: snap.data().username });
      });
  };
  initiatePlan = () => {
    this.firestorePlansRef
      .add({
        recommended: true,
        destination_id: this.props.navigation.getParam("place_id"),
        destinationTypes: this.props.navigation.getParam("types"),
        destination: this.props.navigation.getParam("name"),
        photos: this.props.navigation.getParam("images"),
        location: this.props.navigation.getParam("location"),
        startDate: this.props.navigation.getParam("startDate"),
        endDate: this.props.navigation.getParam("endDate"),
        dateCreated: this.props.navigation.getParam("dateCreated"),
        creatorId: this.user.uid,
        creatorName: this.state.creatorName,
        status: "pending",
        members: this.state.members,
      })
      .catch((err) => {
        console.log("Error Adding Plan!", err);
      });
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
        <Block></Block>
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
    // fontFamily: "Arial",
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

export default SelectMembers;
