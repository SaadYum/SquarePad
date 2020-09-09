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
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Block, Text, theme, Input } from "galio-framework";
import { Card, ListItem, CheckBox } from "react-native-elements";

import { Button, Icon } from "../components";
import { IconButton } from "../components/IconButton";
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

class Interests extends React.Component {
  user = firebase.auth().currentUser.uid;
  firestoreUserRef = firebase.firestore().collection("users").doc(this.user);
  firestoreCurrentInterestsRef = firebase
    .firestore()
    .collection("users")
    .doc(this.user)
    .collection("interests")
    .doc(this.user);
  //   firestorePostRef = firebase.firestore().collection("posts").doc(this.user.uid)
  //   .collection("userPosts");
  storageRef = firebase.storage().ref();

  state = {
    searchWord: "",
    searchResults: [],
    profilePic: Images.ProfilePicture,
    foundUser: "",
    found: false,
    checked: true,
    interestsCompleted: false,
    itemCount: 0,
    interestsArr: [],
    users: [
      { name: "Saad", avatar: Images.ProfilePicture },
      { name: "Saad1", avatar: Images.ProfilePicture },
      { name: "Saad2", avatar: Images.ProfilePicture },
      { name: "Saad3", avatar: Images.ProfilePicture },
      { name: "Saad4", avatar: Images.ProfilePicture },
    ],
    items: [
      {
        name: "Photography",
        id: 1,
        selected: false,
        iconName: "camera",
        iconFamily: "EvilIcons",
        color: "tomato",
      },
      {
        name: "Research",
        id: 2,
        selected: false,
        iconName: "location",
        iconFamily: "EvilIcons",
        color: "#3FA7D6",
      },
      {
        name: "Music",
        id: 3,
        selected: false,
        iconName: "customerservice",
        iconFamily: "Antdesign",
        color: "#8EE269",
      },
      {
        name: "Vlogs",
        id: 4,
        selected: false,
        iconName: "videocamera",
        iconFamily: "AntDesign",
        color: "#9B77F3",
      },
      {
        name: "Tech",
        id: 5,
        selected: false,
        iconName: "laptop",
        iconFamily: "antdesign",
        color: "#F5C851",
      },
      {
        name: "Food",
        id: 6,
        selected: false,
        iconName: "drink",
        iconFamily: "Entypo",
        color: "#FAC05E",
      },
      {
        name: "Parks",
        id: 7,
        selected: false,
        iconName: "light-up",
        iconFamily: "Entypo",
        color: "#8EE269",
      },
      {
        name: "Cafes",
        id: 8,
        selected: false,
        iconName: "rest",
        iconFamily: "AntDesign",
        color: "#3FA7D6",
      },
      {
        name: "Beauty",
        id: 9,
        selected: false,
        iconName: "basecamp",
        iconFamily: "Entypo",
        color: "#FF5964",
      },
      {
        name: "Books",
        id: 10,
        selected: false,
        iconName: "book",
        iconFamily: "Entypo",
        color: "#F06543",
      },
      {
        name: "Cars",
        id: 11,
        selected: false,
        iconName: "car",
        iconFamily: "AntDesign",
        color: "#E01A4F",
      },
      {
        name: "Movies",
        id: 12,
        selected: false,
        iconName: "folder-video",
        iconFamily: "Entypo",
        color: "#F9C22E",
      },
      {
        name: "Education",
        id: 13,
        selected: false,
        iconName: "book",
        iconFamily: "AntDesign",
        color: "#53B3CB",
      },
      {
        name: "Shopping",
        id: 14,
        selected: false,
        iconName: "gift",
        iconFamily: "AntDesign",
        color: "#809FFC",
      },
      {
        name: "Sports",
        id: 15,
        selected: false,
        iconName: "dribbble",
        iconFamily: "Entypo",
        color: "#8EE269",
      },
      {
        name: "Culture",
        id: 16,
        selected: false,
        iconName: "globe",
        iconFamily: "Entypo",
        color: "#35A7FF",
      },
    ],
  };

  onSelect = (id) => {
    const itemIndex = this.state.items.findIndex((item) => item.id === id);
    const item = this.state.items.find((item) => item.id === id);
    let count = this.state.itemCount;
    // console.log(item);
    let itemsCopy = this.state.items;
    if (!itemsCopy[itemIndex].selected) {
      count++;
      this.setState({ itemCount: count });
    } else {
      count--;
      this.setState({ itemCount: count });
    }
    itemsCopy[itemIndex].selected = !itemsCopy[itemIndex].selected;
    this.setState(
      {
        items: itemsCopy,
      },
      () => {
        let interestsArr = [];
        this.state.items.forEach((interest) => {
          if (interest.selected) {
            interestsArr.push(interest.name);
          }
        });
        this.setState({ interestsArr: interestsArr });
      }
    );
  };

  onUpdate = () => {
    if (this.state.itemCount < 3) {
      alert("Please Select atleast 3 tags!");
    } else {
      this.state.interestsCompleted = true;
      this.firestoreUserRef
        .set(
          {
            interests: this.state.items,
            interestsArr: this.state.interestsArr,
            interested: true,
          },
          { merge: true }
        )
        .then(() => {
          this.firestoreCurrentInterestsRef
            .set({
              interestsArr: this.state.interestsArr,
            })
            .then(() => {
              alert("Updated!");
            });

          this.storeToken();
          try {
            this.props.navigation.goBack();
          } finally {
            this.props.navigation.navigate("SignedIn");
          }
        });
    }
  };

  getInterests = () => {
    this.firestoreUserRef.get().then((doc) => {
      if (doc.data().interested) {
        // console.log(doc.data().interests)
        let interestsArr = this.searchArray(doc.data().interests);

        this.setState({
          items: doc.data().interests,
          interestsCompleted: true,
          itemCount: interestsArr.length,
        });
        console.log(this.state.itemCount);
      } else {
        this.setState({ interestsCompleted: true });
      }
    });
  };

  searchArray = (myArray) => {
    let interestsArr = [];
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].selected) {
        interestsArr.push(myArray[i]);
      }
    }
    return interestsArr;
  };

  //AsynchStorage for pre loggin for already logged in users
  storeToken = async () => {
    this.firestoreUserRef.onSnapshot(async (doc) => {
      try {
        await AsyncStorage.setItem("userData", JSON.stringify(doc.data()));
      } catch (error) {
        console.log("Something went wrong", error);
      }
    });
  };

  componentDidMount = () => {
    this.storeToken();
    this.getInterests();
  };

  UNSAFE_componentWillMount = () => {
    if (this.user) {
      this.getInterests();
    }
  };

  renderInterests = () => {
    const items = this.state.items;
    // console.log(this.state.items);
    return (
      <SafeAreaView>
        <Block
          center
          shadow
          style={{
            width: width * 0.9,
            backgroundColor: "#f5f5f5",
            borderRadius: 5,
          }}
        >
          <FlatList
            showsVerticalScrollIndicator={false}
            data={items}
            numColumns={2}
            renderItem={({ item }) => (
              <IconButton item={item} onSelect={this.onSelect} />
            )}
            keyExtractor={(item) => item.id}
            extraData={(item) => item.selected}
          />
        </Block>
      </SafeAreaView>
    );
  };

  textInput = (word) => {
    this.setState({ searchWord: word });
    this.searchUser(word);
  };
  renderSearchBar = () => {
    const { navigation } = this.props;
    return (
      <Block row flex style={styles.inputContainer}>
        <Block left flex={4}>
          <Input
            color="black"
            style={styles.todoInput}
            placeholder="Add new todo.."
            placeholderTextColor={"#8898AA"}
            // onFocus={() => navigation.navigate('Pro')}
            onChangeText={(word) => this.textInput(word)}
            value={this.state.searchWord}
          />
        </Block>
        <Block right flex={1}>
          <Button
            onlyIcon
            icon="pluscircle"
            iconFamily="antdesign"
            iconSize={25}
            color="#f5f5f5"
            iconColor="#fff"
            style={{ width: 30, height: 30, marginTop: 12, marginRight: 8 }}
          ></Button>
        </Block>
      </Block>
    );
  };

  render() {
    return (
      <Block flex center>
        {/* <Block flex={1}/> */}
        {/* <Block flex={2}>
                {this.renderSearchBar()}
            </Block> */}
        <Block flex={1} style={{ marginTop: 10, marginBottom: 5 }}>
          <Text h4>Select atleast 3 interests: </Text>
        </Block>

        <Block flex={14}>
          {this.state.interestsCompleted && this.renderInterests()}
        </Block>
        <Block flex={2} style={{ marginTop: 12 }}>
          <Button
            round
            style={{ width: width * 0.7 }}
            color="tomato"
            onPress={this.onUpdate}
          >
            Update
          </Button>
        </Block>
        {/* {this.state.interestsCompleted &&
              <Block flex={2}>
                <ActivityIndicator size="large"/>
              </Block>
            } */}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    height: 48,
    width: width - 36,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  todoInput: {
    height: 40,
    width: width * 0.6,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  item: {
    backgroundColor: "#ff6347",
    borderRadius: 5,
    padding: 20,
    height: 180,
    width: width * 0.4,
    marginVertical: 8,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 32,
  },
});

export default Interests;
