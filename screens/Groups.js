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
  Keyboard,
} from "react-native";
import { Block, theme, Text, Input } from "galio-framework";

import { Card, Button, Select, Icon } from "../components";
// import articles from '../constants/articles';
import { logOut } from "../services/auth.service";
import * as firebase from "firebase";
import { Images } from "../constants";
import { FlatList } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import GroupCard from "../components/GroupCard";

const { width } = Dimensions.get("screen");
const { height } = Dimensions.get("screen");

class Groups extends React.Component {
  user = firebase.auth().currentUser;
  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePostRef = firebase.firestore().collection("posts");
  firestoreFollowingRef = firebase
    .firestore()
    .collection("following")
    .doc(this.user.uid)
    .collection("userFollowing");

  state = {
    country: "uk",
    foundGroups: [],
    myGroups: [],
    suggestedGroups: [],
    allGroups: [],
    searchWord: "",
    searching: false,
    found: false,
    refreshing: false,
    myGroupsTab: true,
    suggestedTab: false,
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
    interests: [],
    types: [
      "Photography",
      "Research",
      "Music",
      "Vlogs",
      "Tech",
      "Food",
      "Parks",
      "Cafes",
      "Beauty",
      "Books",
      "Cars",
      "Movies",
      "Education",
      "Shopping",
      "Sports",
      "Culture",
    ],
  };

  textInput = (word) => {
    this.setState({ searchWord: word });
    this.searchGroups(word);
  };

  searchGroups = (word) => {
    let foundGroups = [];

    firebase
      .firestore()
      .collection("groups")
      .where("groupTitle", "==", word)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          if (doc.exists) {
            foundGroups.push(doc.data());
            this.setState({ foundGroups: foundGroups, found: true }, () =>
              console.log(foundGroups)
            );
          } else {
            this.setState({ found: false });
          }
        });
      });
  };

  getMyGroups = async (callback) => {
    let myGroups = [];
    await firebase
      .firestore()
      .collection("groups")
      .where("creatorId", "==", this.user.uid)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          myGroups.push(doc.data());
          this.setState({ myGroups: myGroups });
        });
      })
      .then(async () => {
        await firebase
          .firestore()
          .collection("groups")
          .where("memberIds", "array-contains", this.user.uid)
          .get()
          .then((docs) => {
            docs.forEach((doc) => {
              myGroups.push(doc.data());
              this.setState({ myGroups: myGroups });
            });
          });
      });
  };

  getSuggestedGroups = async () => {
    let suggestedGroups = [];
    let interests = this.state.interests; /// QUERY LIMIT 10
    interests = interests.slice(0, 10); /// QUERY LIMIT 10

    await firebase
      .firestore()
      .collection("groups")
      .where("groupType", "in", interests)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          if (doc.data().creatorId != this.user.uid) {
            let memberCheckArr = doc
              .data()
              .memberIds.find((memberId) => memberId == this.user.uid);
            if (memberCheckArr != this.user.uid) {
              suggestedGroups.push(doc.data());
              this.setState({ suggestedGroups: suggestedGroups }, () =>
                console.log(this.state.suggestedGroups)
              );
            }
          }
        });
      });
  };

  getAllGroups = async () => {
    let allGroups = [];

    await firebase
      .firestore()
      .collection("groups")
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          allGroups.push(doc.data());
          this.setState({ allGroups: allGroups }, () =>
            console.log(this.state.allGroups)
          );
        });
      });
  };

  getInterests = (callback) => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("interests")
      .doc(this.user.uid)
      .get()
      .then((doc) => {
        this.setState(
          {
            interests: doc.data().interestsArr,
          },
          () => {
            console.log(this.state.interests);
            callback();
          }
        );
      });
  };

  UNSAFE_componentWillMount = () => {
    this.getMyGroups();
    this.getInterests(() => {
      this.getAllGroups();
      this.getSuggestedGroups();
      console.log(this.state.myGroups);
      console.log(this.state.suggestedGroups);
    });
  };

  renderAddGroupButton = () => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "tomato",
          width: width * 0.3,
          height: 40,
          alignItems: "center",
          borderRadius: 15,
          marginLeft: 65,
        }}
        onPressIn={() => {
          this.props.navigation.navigate("AddGroup");
        }}
      >
        <Block row style={{ marginTop: 5 }}>
          <Text h4 color="white">
            New
          </Text>
          <Icon
            style={{ marginLeft: 5, paddingVertical: 2.5 }}
            size={25}
            color={theme.COLORS.WHITE}
            name="plus"
            family="AntDesign"
          />
        </Block>
      </TouchableOpacity>
    );
  };

  renderMyGroups = () => {
    let myGroups = this.state.myGroups;

    return (
      <Block flex center style={styles.home}>
        <Block
          row
          style={{ marginTop: 10, zIndex: 2, alignSelf: "flex-start" }}
        >
          {/* {!this.state.searching && this.renderDropDown()} */}
          <Text h3 color="grey" style={{ left: 20 }}>
            My Groups
          </Text>
          {this.renderAddGroupButton()}
        </Block>
        {this.state.searching && this.renderSearchBar()}
        <Block style={{ marginTop: 10, zIndex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            // onScrollEndDrag={}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
            data={this.state.myGroups}
            renderItem={({ item }) => (
              <GroupCard navigation={this.props.navigation} group={item} full />
            )}
            keyExtractor={(item) => item.groupId}
            horizontal={false}
            numColumns={2}
          />
        </Block>
      </Block>
    );
  };

  renderSuggestedGroups = () => {
    return (
      <Block flex center style={styles.home}>
        <Block style={{ marginTop: 10, zIndex: 2, alignSelf: "flex-start" }}>
          {/* {this.state.searching && this.renderSearchBar()} */}
          {/* {!this.state.searching && this.renderDropDown()} */}
          <Text h3 color="grey" style={{ left: 20 }}>
            Suggested
          </Text>
        </Block>
        <Block style={{ marginTop: 10, zIndex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            // onScrollEndDrag={}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
            data={this.state.suggestedGroups}
            renderItem={({ item }) => (
              <GroupCard navigation={this.props.navigation} group={item} full />
            )}
            keyExtractor={(item) => item.groupId}
            horizontal={false}
            numColumns={2}
          />
        </Block>
      </Block>
    );
  };
  renderAllGroups = () => {
    return (
      <Block flex center style={styles.home}>
        <Block style={{ marginTop: 10, zIndex: 2 }}>
          {this.state.searching && this.renderSearchBar()}
          {/* {!this.state.searching && this.renderDropDown()} */}
        </Block>
        <Block style={{ marginTop: 10, zIndex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            // onScrollEndDrag={}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
            data={
              !this.state.found ? this.state.allGroups : this.state.foundGroups
            }
            renderItem={({ item }) => (
              <GroupCard navigation={this.props.navigation} group={item} full />
            )}
            keyExtractor={(item) => item.groupId}
            horizontal={false}
            numColumns={2}
          />
        </Block>
      </Block>
    );
  };

  renderSearchBar = () => {
    const { navigation } = this.props;
    return (
      <Block row style={{ right: 10 }}>
        <Input
          right
          color="black"
          style={styles.search}
          placeholder="Search"
          placeholderTextColor={"#8898AA"}
          // onFocus={() => navigation.navigate('Pro')}
          // onSubmitEditing={Keyboard.dismiss}
          // onEndEditing={() => /}
          onChangeText={(word) => {
            this.setState(
              { foundGroups: [], searchWord: word },
              this.textInput(word)
            );
            if (this.state.searchWord == "") {
              this.setState({ found: false });
            }
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
        <TouchableOpacity
          style={{
            height: 48,
            borderRadius: 10,
            top: 6,
            left: 10,
            backgroundColor: "#ebebeb",
            width: width * 0.18,
          }}
          onPressIn={() => {
            this.setState({ found: false, searchWord: "" });
          }}
        >
          <Text style={{ margin: 17, color: "grey" }}>Clear</Text>
        </TouchableOpacity>
      </Block>
    );
  };

  renderDropDown = () => {
    const { navigation } = this.props;
    return (
      <DropDownPicker
        items={[
          {
            label: "UK",
            value: "uk",
            icon: () => <Icon name="flag" size={18} color="#900" />,
          },
          {
            label: "France",
            value: "france",
            icon: () => <Icon name="flag" size={18} color="#900" />,
          },
        ]}
        // defaultValue={this.state.country}
        placeholder="Filter Results"
        containerStyle={{
          height: 40,
          width: width * 0.7,
          marginTop: 10,
        }}
        style={{
          // marginTop: 10,
          backgroundColor: "#ebebeb",
          width: width * 0.7,
        }}
        itemStyle={{
          justifyContent: "flex-start",
        }}
        dropDownStyle={{ backgroundColor: "#ebebeb" }}
        onChangeItem={(item) =>
          this.setState({
            country: item.value,
          })
        }
      />
    );
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.getAllGroups();
    this.getSuggestedGroups();
    this.getMyGroups().then(() => {
      this.setState({ refreshing: false });
    });
  };

  render() {
    return (
      <Block>
        {/* <Image source ={{}}/> */}
        <ImageBackground
          source={Images.groupsMain}
          style={styles.profileContainer}
          imageStyle={styles.profileBackground}
        >
          <Block flex center style={{ marginTop: 45 }}>
            <Text h3 color="#ebebeb">
              Groups
            </Text>
            {/* <Text h5 style={{ alignSelf: "left" }} color="#ebebeb">
              Explore Groups!
            </Text> */}
            <Block row style={{ marginTop: 20 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: this.state.myGroupsTab
                    ? "#cccccc"
                    : "#efefef",
                  width: width * 0.25,
                  height: 40,
                  alignItems: "center",

                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
                onPress={() => {
                  this.setState({
                    myGroupsTab: true,
                    suggestedTab: false,
                    searching: false,
                  });
                }}
              >
                <Text
                  h5
                  color={this.state.myGroupsTab ? "white" : "grey"}
                  style={{ marginTop: 8 }}
                >
                  My Groups
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: this.state.searching ? "#cccccc" : "#efefef",
                  width: width * 0.25,
                  height: 40,
                  alignItems: "center",
                  borderRightColor: "grey",
                  borderRightWidth: 1,

                  borderLeftColor: "grey",
                  borderLeftWidth: 0.1,
                }}
                onPress={() => {
                  this.setState({
                    searching: true,
                    myGroupsTab: false,
                    suggestedTab: false,
                  });
                }}
              >
                <Text
                  h5
                  color={this.state.searching ? "white" : "grey"}
                  style={{ marginTop: 8 }}
                >
                  Search
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: this.state.suggestedTab
                    ? "#cccccc"
                    : "#efefef",
                  width: width * 0.25,
                  height: 40,
                  alignItems: "center",

                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 10,
                }}
                onPress={() => {
                  this.setState({
                    myGroupsTab: false,
                    suggestedTab: true,
                    searching: false,
                  });
                }}
              >
                <Text
                  h5
                  color={this.state.suggestedTab ? "white" : "grey"}
                  style={{ marginTop: 8 }}
                >
                  Suggested
                </Text>
              </TouchableOpacity>
            </Block>
            {this.state.suggestedTab && this.renderSuggestedGroups()}
            {this.state.myGroupsTab && this.renderMyGroups()}
            {this.state.searching && this.renderAllGroups()}
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    marginTop: 10,
    width: width * 0.9,
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
    width: width * 0.6,
    marginLeft: 16,
    borderWidth: 1,
    borderRadius: 15,
    // marginTop: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
});

export default Groups;
