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
} from "react-native";
import { Block, theme, Text, Input } from "galio-framework";

import { Card, Button, Select, Icon } from "../components";
// import articles from '../constants/articles';
import { logOut } from "../services/auth.service";
import * as firebase from "firebase";
import { Images } from "../constants";
import {
  FlatList,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import GroupCard from "../components/GroupCard";
import { ListItem } from "react-native-elements";
import Spinner from "react-native-loading-spinner-overlay";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("screen");
const { height } = Dimensions.get("screen");

class AddGroup extends React.Component {
  user = firebase.auth().currentUser;
  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePostRef = firebase.firestore().collection("posts");
  storageRef = firebase.storage().ref();
  firestoreFollowingRef = firebase
    .firestore()
    .collection("following")
    .doc(this.user.uid)
    .collection("userFollowing");

  state = {
    spinner: false,
    // country: "uk",
    foundGroups: [],
    myGroups: [],
    mediaFile: Images.galleryIcon,
    searchWord: "",
    searchResults: [],
    searching: false,
    refreshing: false,
    myGroupsTab: true,
    suggestedTab: false,
    members: [],
    memberIds: [],
    groupTitle: "",
    groupDescription: "",
    groupType: "",
    groupCreator: {},
    searchWord: "",
    foundUser: "",
    profilePic: "",
    groupPhoto: "",
    found: false,

    types: [
      {
        label: "Photography",
        value: "Photography",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Research",
        value: "Research",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Music",
        value: "Music",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Vlogs",
        value: "Vlogs",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Tech",
        value: "Tech",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Food",
        value: "Food",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Parks",
        value: "Parks",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Cafes",
        value: "Cafes",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Beauty",
        value: "Beauty",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Books",
        value: "Books",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Cars",
        value: "Cars",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Movies",
        value: "Movies",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Education",
        value: "Education",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Shopping",
        value: "Shopping",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Sports",
        value: "Sports",
        icon: () => <Icon name="flag" size={18} color="#900" />,
      },
      {
        label: "Culture",
        value: "Culture",
        icon: () => <Icon name="flag" size={18} color="#900" />,
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
    };
    let allMembers = this.state.members;
    let memberIds = this.state.memberIds;

    memberIds = memberIds.filter((pmember) => pmember != member.userId);
    memberIds.push(member.userId);
    allMembers = allMembers.filter(
      (pmember) => pmember.userId != member.userId
    );
    allMembers.push(member);

    this.setState({
      members: allMembers,
      memberIds: memberIds,
      searchWord: "",
      found: false,
      searchResults: [],
    });

    console.log(allMembers);
  };

  searchUser(word) {
    let userCollectionRef = firebase.firestore().collection("users");

    let users = [];
    userCollectionRef
      .where("username", "==", word)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          if (documentSnapshot.id == this.user.uid) {
            return;
          } else {
            users.push(documentSnapshot.data());
            console.log(documentSnapshot.data());
            this.setState({
              foundUser: documentSnapshot.id,
              push_token: documentSnapshot.data().push_token,
              found: true,
            });
          }
        });

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

  renderUserItem = () => {
    const { navigation } = this.props;

    return (
      <Block style={{ height: height * 0.1 }}>
        <Block
          row
          flex
          style={{
            // paddingHorizontal: 6,
            // marginHorizontal: 16,
            // paddingBottom: 8,
            // paddingTop: 8,
            backgroundColor: "#f7f7f7",
            borderRadius: 20,
            borderColor: "#f7f7f7",
            borderWidth: 0,
            paddingTop: 5,
            width: width * 0.8,
          }}
        >
          <Block row left flex={3} style={{ left: 20 }}>
            <Block style={{ top: 5 }}>
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
          <Block flex={1}>
            <Button
              onlyIcon
              icon="plus"
              iconFamily="antdesign"
              iconSize={20}
              color="tomato"
              iconColor="#fff"
              style={{ width: 40, height: 40, marginTop: 5 }}
              onPress={this.addMember}
            ></Button>
          </Block>
        </Block>
      </Block>
    );
  };

  renderMembersList = () => {
    const { params } = this.props.navigation.state;

    // const {name, avatar} = this.props;
    return (
      <Block>
        <Block
          center
          style={{
            width: width * 0.8,
            backgroundColor: "#f5f5f5",
            borderRadius: 20,
            top: 15,
          }}
        >
          {this.state.members.length > 0 && (
            <Text h5 color="grey" style={{ top: 2 }}>
              Members
            </Text>
          )}
          <ScrollView
            style={{ maxHeight: 150 }}
            showsVerticalScrollIndicator={false}
          >
            {this.state.members &&
              this.state.members.map((u, i) => {
                if (u.userId != this.user.uid) {
                  return (
                    <Block left row key={i}>
                      <ListItem
                        containerStyle={{
                          width: width * 0.6,
                          backgroundColor: "#f5f5f5",
                        }}
                        title={u.name}
                        leftAvatar={{ source: { uri: u.avatar } }}
                      />
                      <Button
                        onlyIcon
                        icon="minuscircle"
                        iconFamily="antdesign"
                        iconSize={30}
                        color="#f5f5f5"
                        iconColor="#fff"
                        style={{
                          width: 40,
                          height: 40,
                          marginTop: 15,
                          right: 15,
                        }}
                        onPress={() => {
                          this.removeMember(u.name);
                        }}
                      ></Button>
                    </Block>
                  );
                }
              })}
          </ScrollView>
        </Block>
        {this.state.groupTitle != "" && this.state.groupType != "" && (
          <Block center style={{ margin: 30 }}>
            <Button
              round
              size="small"
              color="tomato"
              onPress={() => {
                this.createGroup();
              }}
            >
              Create
            </Button>
          </Block>
        )}
      </Block>
    );
  };

  createGroup = () => {
    let members = this.state.members;
    let memberIds = this.state.memberIds;
    let groupTitle = this.state.groupTitle;
    let groupDescription = this.state.groupDescription;
    let groupType = this.state.groupType;
    let groupCreator = this.state.groupCreator;
    let groupPhoto = this.state.groupPhoto;

    this.setState({ spinner: true });
    firebase
      .firestore()
      .collection("groups")
      .add({
        creatorId: this.user.uid,
        groupCreator: groupCreator,
        groupTitle: groupTitle,
        groupDescription: groupDescription,
        groupType: groupType,
        members: members,
        memberIds: memberIds,
        groupPhoto: groupPhoto,
      })
      .then((doc) => {
        this.sendMemberInvites(members, doc.id);

        doc.set({ groupId: doc.id }, { merge: true });
        this.setState({ spinner: false });
        alert("Added");
        this.props.navigation.goBack();
      });
  };

  sendMemberInvites = (members, groupId) => {
    let groupTitle = this.state.groupTitle;
    let groupDescription = this.state.groupDescription;
    let groupType = this.state.groupType;
    let groupCreator = this.state.groupCreator;
    let groupPhoto = this.state.groupPhoto;

    let memberIds = this.state.memberIds;

    members.forEach((member) => {
      firebase
        .firestore()
        .collection("notifications")
        .doc(member.userId)
        .collection("userNotifications")
        .add({
          content:
            this.state.groupCreator.name +
            " invited you to Join Group: " +
            this.state.groupTitle,
          time: new Date(),
          type: "groupInvitation",
          userId: this.user.uid,
          group: {
            creatorId: this.user.uid,
            groupCreator: groupCreator,
            groupTitle: groupTitle,
            groupDescription: groupDescription,
            groupType: groupType,
            members: members,
            memberIds: memberIds,
            groupPhoto: groupPhoto,
            groupId: groupId,
          },
        });
      this.sendPushNotification(member.push_token);
    });
  };

  sendPushNotification = async (title, body, pushToken) => {
    const message = {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: { data: "goes here" },
      ios: { _displayInForeground: true },
      _displayInForeground: true,
    };
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  // Pick from Gallery
  chooseFromGallery = async () => {
    let mediaFile = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
    });

    if (!mediaFile.cancelled) {
      console.log(mediaFile);

      this.setState({ mediaFile: mediaFile.uri });
    }
  };

  uploadPhoto = async (uri, fileName) => {
    if (uri == Images.galleryIcon) {
      return false;
    } else {
      const response = await fetch(uri);
      const blob = await response.blob();

      const ref = firebase
        .storage()
        .ref()
        .child("groupImages/" + fileName);
      return ref.put(blob);
    }
  };

  getGroupCreator = async () => {
    let groupCreator;
    let profilePic = this.storageRef.child(
      "profilePics/(" + this.user.uid + ")ProfilePic"
    );

    await profilePic.getDownloadURL().then(async (url) => {
      await firebase
        .firestore()
        .collection("users")
        .doc(this.user.uid)
        .get()
        .then((doc) => {
          groupCreator = {
            id: this.user.uid,
            name: doc.data().username,
            avatar: url,
            push_token: doc.data().push_token,
          };
          this.setState({ groupCreator: groupCreator });
        });
    });
  };

  UNSAFE_componentWillMount = () => {
    this.getGroupCreator();
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
        placeholder="Invite Members"
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

  renderAddGroupButton = () => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "white",
          width: width * 0.2,
          height: 60,
          alignItems: "center",
          borderRadius: 15,
          marginLeft: 190,
        }}
        onPressIn={() => this.chooseFromGallery()}
      >
        <Image source={{ uri: this.state.mediaFile }} style={styles.addPhoto} />
      </TouchableOpacity>
    );
  };

  renderFields = () => {
    let myGroups = this.state.myGroups;

    return (
      <Block center style={styles.home}>
        <Block>
          {this.titleInput()}
          {this.descriptionInput()}
          {this.renderDropDown()}
          {this.renderSearchBar()}
        </Block>
      </Block>
    );
  };

  titleInput = () => {
    const { navigation } = this.props;
    return (
      <Input
        right
        color="black"
        style={styles.search}
        placeholder={"Enter Title"}
        placeholderTextColor={"#8898AA"}
        // onFocus={() => navigation.navigate('Pro')}
        onChangeText={(word) => {
          this.setState({ groupTitle: word });
        }}
      />
    );
  };

  descriptionInput = () => {
    const { navigation } = this.props;
    return (
      <Input
        color="black"
        maxLength={60}
        style={styles.descriptionInput}
        placeholder={"Enter Description"}
        placeholderTextColor={"#8898AA"}
        // onFocus={() => navigation.navigate('Pro')}
        onChangeText={(word) => {
          this.setState({ groupDescription: word });
        }}
      />
    );
  };

  renderDropDown = () => {
    const { navigation } = this.props;
    return (
      <DropDownPicker
        items={this.state.types}
        // defaultValue={this.state.country}
        placeholder="Type"
        searchable={true}
        searchablePlaceholder="Select type"
        searchablePlaceholderTextColor="gray"
        seachableStyle={{}}
        searchableError={() => <Text>Not Found</Text>}
        containerStyle={{
          height: 40,
          width: width * 0.8,
          //   marginTop: 10,
          //   borderRadius: 20,
        }}
        style={{
          // marginTop: 10,
          //   borderRadius: 20,
          borderColor: "#ebebeb",
          backgroundColor: "#ebebeb",
          width: width * 0.8,
        }}
        itemStyle={{
          justifyContent: "flex-start",
        }}
        dropDownStyle={{ backgroundColor: "#ebebeb" }}
        onChangeItem={(item) =>
          this.setState({
            groupType: item.value,
          })
        }
      />
    );
  };
  renderAvatar = () => {
    const { avatar, item } = this.props;
    // if (!item.avatar) return null;
    return (
      <Image source={{ uri: this.state.profilePic }} style={styles.avatar} />
    );
  };

  onRefresh = () => {
    this.setState({ refreshing: true });

    // this.getFollowingPosts().then(() => {
    //   this.setState({ refreshing: false });
    // });
  };

  render() {
    return (
      <Block>
        <Spinner
          visible={this.state.spinner}
          textContent={"Creating.."}
          textStyle={{ color: "#FFF" }}
        />
        <Block center style={{ marginTop: 45 }}>
          <Text h3 color="grey">
            New Group
          </Text>
          <Block row style={{ zIndex: 2, alignSelf: "flex-start" }}>
            <Text h4 color="grey" style={{ left: 25, marginTop: 20 }}>
              Info
            </Text>
            {this.renderAddGroupButton()}
          </Block>
          {/* <ScrollView> */}
          <Block center>
            {this.renderFields()}
            {this.state.found && this.renderUserItem()}
            {this.renderMembersList()}
          </Block>
          {/* </ScrollView> */}
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    marginTop: 5,
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 25,
    zIndex: 2,
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
    paddingTop: 12,
    paddingLeft: 4,
    color: theme.COLORS.BLACK,
  },
  search: {
    height: 48,
    width: width * 0.8,
    // borderWidth: 1,
    borderRadius: 15,
    // marginTop: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  descriptionInput: {
    height: 80,
    width: width * 0.8,
    // borderWidth: 1,
    borderRadius: 15,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  addPhoto: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
});

export default AddGroup;
