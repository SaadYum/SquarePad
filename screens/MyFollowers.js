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
import { Block, Text, theme } from "galio-framework";

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
import { connect } from "react-redux";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

const mapStateToProps = (state) => {
  // console.log("YESS", state)
  return {
    chats: state.chatReducer.chats,
    users: state.chatReducer.users,
    followedUsers: state.chatReducer.followedUsers,
    followers: state.chatReducer.followers,
  };
};

class MyFollowers extends React.Component {
  state = {
    followers: [],
    currUser: "",
  };
  // componentDidMount = ()=>{
  //     this.getFollowers()
  // }

  //     getFollowers = ()=>{
  //         let followers = []

  //         firebase.firestore().collection("users")
  //         .doc(firebase.auth().currentUser.uid)
  //         .collection("followedBy").get().then((docs)=>{

  //             docs.forEach((doc)=>{
  //             firebase.firestore().collection("users").doc(doc.id)
  //             .get().then((doc)=>{
  //                 let userObj = {
  //                     userId: doc.id,
  //                     profilePic: (typeof(doc.data().profilePic) !="undefined")? doc.data().profilePic: Images.ProfilePicture,
  //                     username: doc.data().username
  //                 }

  //                 followers.push(userObj)
  //                 this.setState({followers: followers});

  //             })
  //             })
  //         }).catch(err=>alert(err))
  //     }

  renderUserItem = (follower) => {
    const { navigation } = this.props;
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("followerProfile", {
            userId: follower.userId,
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
            <Image source={{ uri: follower.avatar }} style={styles.avatar} />

            <Text size={20} style={styles.cardUser}>
              {follower.username}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  };

  renderFollowers = () => {
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
          data={this.props.followers}
          renderItem={({ item }) => this.renderUserItem(item)}
          keyExtractor={(item) => item.userId}
        />
      </Block>
    );
  };

  render() {
    let followers = this.props.followers;
    // console.log(followers);
    return (
      <Block style={{ marginTop: 10 }}>
        {followers.length > 0 ? (
          this.renderFollowers()
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
            <Text>No Followers</Text>
          </Block>
        )}
      </Block>
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
});

export default connect(mapStateToProps, null)(MyFollowers);
