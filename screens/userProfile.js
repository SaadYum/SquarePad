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
} from "react-native";
import { Block, Switch, Text, theme } from "galio-framework";

import { Button } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import * as firebase from "firebase";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";
import { TouchableOpacity } from "react-native-gesture-handler";
// import { getPosts } from "../constants/Images";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

class userProfile extends React.Component {
  state = {
    currentUser: this.props.navigation.getParam("userId"),
    profilePic: Images.ProfilePicture,
    username: "",
    bio: "",
    name: "",
    email: "",
    posts: [],
    postCount: 0,
    following: false,
    followedUsers: 0,
    followedByUsers: 0,
    publicProfile: false,
    sent: false,
    closeFriend: false,
  };

  myId = firebase.auth().currentUser.uid;

  firestoreFollowingRef = firebase
    .firestore()
    .collection("users")
    .doc(this.state.currentUser)
    .collection("following");
  firestoreFollowedByRef = firebase
    .firestore()
    .collection("users")
    .doc(this.state.currentUser)
    .collection("followedBy");
  // Check wether the user has previously added any profile picture
  componentDidMount = () => {
    this.getFollowedUsers();
    this.setState({ currentUser: this.props.navigation.getParam("userId") });
    console.log(this.state.currentUser);
    this.getProfilePic();
  };

  getProfilePic = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.state.currentUser)
      .get()
      .then((doc) => {
        let profilePic = doc.data().profilePic;
        let publicProfile = doc.data().publicProfile;

        if (typeof profilePic != "undefined") {
          this.setState({ profilePic: profilePic });
        } else {
          this.setState({ profilePic: Images.ProfilePicture });
        }
        this.setState({ publicProfile: publicProfile });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ profilePic: Images.ProfilePicture });
      });

    firebase
      .firestore()
      .collection("users")
      .doc(this.myId)
      .collection("sent")
      .doc(this.state.currentUser)
      .get()
      .then((docRef) => {
        if (docRef.exists) {
          this.setState({ sent: true });
        } else {
          this.setState({ sent: false });
        }
      });
  };

  // Get all the users the current user is following
  getFollowedUsers = () => {
    this.firestoreFollowingRef.get().then((querySnapshot) => {
      let num = querySnapshot.size;
      // console.log(num);
      this.setState({ followedUsers: num });
    });

    this.firestoreFollowedByRef.get().then((querySnapshot) => {
      let num = querySnapshot.size;
      // console.log(num);
      this.setState({ followedByUsers: num });
    });
  };

  getRealTimeUpdates = () => {
    const firestoreUserRef = firebase
      .firestore()
      .collection("users")
      .doc(this.state.currentUser);

    firestoreUserRef.onSnapshot((doc) => {
      const res = doc.data();

      this.setState({
        username: res.username,
        bio: res.bio,
        name: res.name,
        email: res.email,
        publicProfile: res.publicProfile,
      });
      console.log(res);
    });
  };

  getPosts = () => {
    var cloudImages = [];
    firebase
      .firestore()
      .collection("posts")
      .doc(this.state.currentUser)
      .collection("userPosts")
      .orderBy("time", "desc")
      .onSnapshot((snapshot) => {
        cloudImages = [];
        snapshot.forEach((doc) => {
          cloudImages.push(doc.data());
        });

        console.log(cloudImages);
        this.setState({ posts: cloudImages.map((post) => post) });
        this.setState({ postCount: this.state.posts.length });
      });
  };

  UNSAFE_componentWillMount() {
    this.getPosts();

    this.getRealTimeUpdates();

    this.getPermissionAsync();

    this.checkFollow();
    this.checkCloseFriend();
  }

  checkFollow = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("following")
      .doc(this.state.currentUser)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          this.setState({ following: true, sent: false });
        } else {
          this.setState({ following: false });
        }
      });
  };

  checkCloseFriend = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .collection("closeFriends")
      .doc(this.state.currentUser)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          this.setState({ closeFriend: true });
        } else {
          this.setState({ closeFriend: false });
        }
      });
  };

  handleFollow = async () => {
    if (!this.state.following) {
      if (this.state.publicProfile) {
        console.log(
          firebase.auth().currentUser.uid +
            " is following " +
            this.state.currentUser
        );
        this.setState({ following: true });

        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("following")
          .doc(this.state.currentUser)
          .set({
            userId: this.state.currentUser,
          })
          .then(() => {
            firebase
              .firestore()
              .collection("users")
              .doc(this.state.currentUser)
              .collection("followedBy")
              .doc(firebase.auth().currentUser.uid)
              .set({
                userId: firebase.auth().currentUser.uid,
              });
            this.setState({ following: true });
          })
          .catch((err) => {
            this.setState({ following: false });
          });
      } else if (!this.state.sent) {
        // NOT A PUBLIC PROFILE ---> Send Request

        this.setState({ sent: true });
        firebase
          .firestore()
          .collection("users")
          .doc(this.myId)
          .collection("sent")
          .doc(this.state.currentUser)
          .set({
            userId: this.state.currentUser,
          })
          .then(() => {
            firebase
              .firestore()
              .collection("users")
              .doc(this.state.currentUser)
              .collection("received")
              .doc(this.myId)
              .set({
                userId: this.myId,
              })
              .then(() => {
                console.log("REQUEST SENT!");

                firebase
                  .firestore()
                  .collection("notifications")
                  .doc(this.state.currentUser)
                  .collection("userNotifications")
                  .doc(this.myId)
                  .set({
                    content: "sent you a follow request",
                    source: this.myId,
                    time: new Date().getTime(),
                    type: "request",
                    userId: this.myId,
                  });
              })
              .catch(() => {
                this.setState({ sent: false });
              });
          })
          .catch((err) => {
            this.setState({ sent: false });
          });
      } else {
        const selection = await new Promise((resolve) => {
          const title = "Follow Request!";
          const message = "Do you want to cancel request!";
          const buttons = [
            { text: "Yes", onPress: () => resolve("cancel") },
            { text: "No", onPress: () => resolve(null) },
          ];
          Alert.alert(title, message, buttons);
        });

        if (selection == "cancel") {
          this.setState({ sent: false });
          firebase
            .firestore()
            .collection("users")
            .doc(this.myId)
            .collection("sent")
            .doc(this.state.currentUser)
            .delete()
            .then(() => {
              firebase
                .firestore()
                .collection("users")
                .doc(this.state.currentUser)
                .collection("received")
                .doc(this.myId)
                .delete()
                .then(() => {
                  console.log("REQUEST CANCELLED!");
                });
            });
        }
      }
    } else {
      const selection = await new Promise((resolve) => {
        const title = "Private Profile!";
        const message = "Unfollow?";
        const buttons = [
          { text: "Yes", onPress: () => resolve("continue") },
          { text: "No", onPress: () => resolve(null) },
        ];
        Alert.alert(title, message, buttons);
      });
      if (selection == "continue") {
        console.log("UNFOLLOWED");
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("following")
          .doc(this.state.currentUser)
          .delete()
          .then(() => {
            this.setState({ following: false });
          })
          .catch((err) => {
            this.setState({ following: true });
          });
      }
    }
  };

  handleCloseFriend = () => {
    if (!this.state.closeFriend) {
      console.log(
        firebase.auth().currentUser.uid +
          " is closeFriends with " +
          this.state.currentUser
      );
      this.setState({ closeFriend: true }, () => {
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("closeFriends")
          .doc(this.state.currentUser)
          .set({
            userId: this.state.currentUser,
          })
          .then(() => {
            this.setState({ closeFriend: true });
          })
          .catch((err) => {
            this.setState({ closeFriend: false });
          });
      });
    } else {
      this.setState({ closeFriend: false }, () => {
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("closeFriends")
          .doc(this.state.currentUser)
          .delete()
          .then(() => {
            this.setState({ closeFriend: false });
          })
          .catch((err) => {
            this.setState({ closeFriend: true });
          });
      });
    }
  };

  renderFollow = () => {
    if (this.state.following) {
      return (
        <Block>
          <Button
            small
            shadowless={true}
            icon="edit"
            iconFamily="AntDesign"
            style={{
              marginTop: 20,
              backgroundColor: "#e6e6e6",
              borderRadius: 25,
              height: 40,
            }}
            onPress={this.handleFollow}
          >
            Following
          </Button>
        </Block>
      );
    } else {
      return (
        <Block>
          <Button
            small
            shadowless={true}
            icon="edit"
            iconFamily="AntDesign"
            style={{
              marginTop: 20,
              backgroundColor: "#ff6a4e",
              borderRadius: 25,
              height: 40,
            }}
            onPress={this.handleFollow}
          >
            {!this.state.publicProfile && this.state.sent ? (
              <Text style={{ color: "white" }}>Requested</Text>
            ) : (
              <Text style={{ color: "white" }}>Follow</Text>
            )}
          </Button>
        </Block>
      );
    }
  };
  renderCloseFriends = () => {
    return (
      <Block
        style={{
          backgroundColor: "whitesmoke",
          borderRadius: 20,
          paddingBottom: 10,
          marginTop: 10,
        }}
      >
        <Block center style={{ marginTop: 5 }}>
          <Text> Close Friends </Text>
          <Switch
            style={{ marginTop: 5 }}
            color={"#e6e6e6"}
            value={this.state.closeFriend}
            onValueChange={() => this.handleCloseFriend()}
          />
        </Block>
      </Block>
    );
  };

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    }
  };

  render() {
    let { profilePic } = this.state;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width, marginTop: "5%" }}
      >
        <Block style={styles.profileCard}>
          <Block middle row space="evenly" style={{ paddingBottom: 24 }}>
            <Block middle style={styles.avatarContainer}>
              <TouchableOpacity>
                <Image
                  source={{ uri: profilePic }}
                  style={styles.avatar}
                  onLong
                />
              </TouchableOpacity>
            </Block>

            <Block>
              {this.renderFollow()}
              {this.renderCloseFriends()}
            </Block>
          </Block>
          <Block style={styles.info}>
            <Block row space="between">
              <Block middle>
                <Text
                  bold
                  size={12}
                  color="#525F7F"
                  style={{ marginBottom: 4 }}
                >
                  {this.state.followedByUsers}
                </Text>
                <Text size={12}>Followers</Text>
              </Block>
              <Block middle>
                <Text
                  bold
                  color="#525F7F"
                  size={12}
                  style={{ marginBottom: 4 }}
                >
                  {this.state.followedUsers}
                </Text>
                <Text size={12}>Following</Text>
              </Block>
              <Block middle>
                <Text
                  bold
                  color="#525F7F"
                  size={12}
                  style={{ marginBottom: 4 }}
                >
                  {this.state.postCount}
                </Text>
                <Text size={12}>Posts</Text>
              </Block>
            </Block>
          </Block>
          <Block flex>
            <Block middle style={styles.nameInfo}>
              <Text bold size={28} color="#32325D">
                {this.state.username}
              </Text>
              <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                {this.state.name}
              </Text>
            </Block>
            <Block middle style={{ marginTop: 10, marginBottom: 10 }}>
              <Block style={styles.divider} />
            </Block>
            <Block middle>
              <Text size={16} color="#525F7F" style={{ textAlign: "center" }}>
                {this.state.bio}
              </Text>
            </Block>

            <Block row style={{ paddingVertical: 5, alignItems: "baseline" }}>
              <Text bold size={16} color="#525F7F">
                Posts
              </Text>
            </Block>
            <Block
              row
              style={{ paddingBottom: 20, justifyContent: "flex-end" }}
            >
              {/* <Button
                      small
                      color="transparent"
                      textStyle={{ color: "#5E72E4", fontSize: 12 }}
                    >
                      View all
                    </Button> */}
            </Block>
            {((this.state.following && !this.state.publicProfile) ||
              this.state.publicProfile) && (
              <Block>
                <Block style={{ paddingBottom: -HeaderHeight * 2 }}>
                  <Block row space="between" style={{ flexWrap: "wrap" }}>
                    {/* {Images.Viewed.map((img, imgIndex) => ( */}
                    {this.state.posts.map((post, postIndex) => (
                      <TouchableOpacity
                        key={postIndex}
                        onPress={() => {
                          let route = this.props.navigation.state.routeName;

                          if (route == "Profile") {
                            // console.log(postIndex);
                            this.props.navigation.navigate("Post", {
                              username: this.state.username,
                              title: "",
                              avatar: this.state.profilePic,
                              image: post.image,
                              cta: "View article",
                              caption: post.caption,
                              location: post.location.locationName,
                              postId: post.postId,
                              userId: this.state.currentUser,
                            });
                          } else if (route == "userProfile") {
                            // console.log(postIndex);
                            this.props.navigation.navigate("userPost", {
                              username: this.state.username,
                              title: "",
                              avatar: this.state.profilePic,
                              image: post.image,
                              cta: "View article",
                              caption: post.caption,
                              location: post.location.locationName,
                              postId: post.postId,
                              userId: this.state.currentUser,
                            });
                          } else {
                            this.props.navigation.navigate("searchUserPost", {
                              username: this.state.username,
                              title: "",
                              avatar: this.state.profilePic,
                              image: post.image,
                              cta: "View article",
                              caption: post.caption,
                              location: post.location.locationName,
                              postId: post.postId,
                              userId: this.state.currentUser,
                            });
                          }
                        }}
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
                </Block>
              </Block>
            )}

            {!this.state.following && !this.state.publicProfile && (
              <Text h5 style={{ alignSelf: "center" }}>
                Private profile!
              </Text>
            )}
          </Block>
        </Block>
      </ScrollView>
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
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: Platform.OS === "ios" ? 65 : 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: theme.COLORS.WHITE,
    // shadowColor: "black",
    // shadowOffset: { width: 0, height: 0 },
    // shadowRadius: 8,
    // shadowOpacity: 0.2,
    zIndex: 2,
  },
  info: {
    paddingHorizontal: 40,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 0,
  },
  nameInfo: {
    marginTop: 20,
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
});

export default userProfile;
