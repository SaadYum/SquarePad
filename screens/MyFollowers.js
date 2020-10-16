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
import { Block, Text, theme } from "galio-framework";

import { Button } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import * as firebase from "firebase";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";

import Constants from "expo-constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import { logOut } from "../services/auth.service";
// import { getPosts } from "../constants/Images";

const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

class MyFollowers extends React.Component {
  
state = {
    followers: [],
    currUser: ""
}
componentDidMount = ()=>{
    this.getFollowers()
}

    getFollowers = ()=>{
        let followers = []

        firebase.firestore().collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("followedBy").get().then((docs)=>{
            
            docs.forEach((doc)=>{
            firebase.firestore().collection("users").doc(doc.id)
            .get().then((doc)=>{
                let userObj = {
                    userId: doc.id,
                    profilePic: doc.data().profilePic,
                    username: doc.data().username
                }

                followers.push(userObj)
                this.setState({followers: followers});

            }).catch(err=>alert(err))
            })
        }).catch(err=>alert(err))
    }

    renderUserItem = (follower) => {
        const { navigation } = this.props;
          return (
            <Block
              row
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
              <Block>
                <TouchableWithoutFeedback
                //   onPress={() =>
                //     navigation.navigate("searchUserProfile", {
                //       userId: this.state.foundUser,
                //     })
                //   }
                >
                        <Image source={{ uri: follower.profilePic }} style={styles.avatar} />

                </TouchableWithoutFeedback>
              </Block>
              <Block>
                <TouchableWithoutFeedback
                //   onPress={() =>
                //     navigation.navigate("searchUserProfile", {
                //       userId: this.state.foundUser,
                //     })
                //   }
                >
                  <Text size={20} style={styles.cardUser}>
                    {follower.username}
                  </Text>
                </TouchableWithoutFeedback>
              </Block>
            </Block>
          );
      };
    


  render() {
    let { profilePic } = this.state;

    return (
    <Block>
        <ScrollView
          showsVerticalScrollIndicator={false}
          // style = {styles.article}
        >
            {this.state.followers.forEach(follower => {
                
          <Block>{this.renderUserItem(follower)}</Block>
            })
            }
        </ScrollView>
    </Block>)
}}

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

export default MyFollowers;
