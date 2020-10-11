import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  AsyncStorage,
  View,
} from "react-native";
import {
  CreateUser,
  SigninUser,
  isUserSignedIn,
  logOut,
} from "../services/auth.service";
import { Block, Checkbox, Switch, Text, theme } from "galio-framework";
import * as firebase from "firebase";

import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("screen");

class ProfileSettings extends React.Component {
  userId = firebase.auth().currentUser.uid;

  state = {
    closeFriendsSelected: false,
    privateProfile: true,
  };

  componentDidMount = () => {
    this.getProfileStatus();
  };

  getProfileStatus = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.userId)
      .onSnapshot((doc) => {
        let data = doc.data();
        this.setState({ privateProfile: !data.publicProfile });
      });
  };

  toggleSwitch = () => {
    this.setState({ closeFriendsSelected: !this.state.closeFriendsSelected });
  };

  togglePrivateProfile = () => {
    this.setState({ privateProfile: !this.state.privateProfile }, () => {
      firebase.firestore().collection("users").doc(this.userId).set(
        {
          publicProfile: !this.state.privateProfile,
        },
        { merge: true }
      );
    });
  };
  render() {
    return (
      <Block flex center style={{ top: 30 }}>
        <Block>
          <Block
            center
            style={{
              backgroundColor: "#f5f5f5",
              width: width * 0.77,
              height: 50,
              borderRadius: 10,
            }}
          >
            <TouchableOpacity
              style={{ paddingTop: 15 }}
              onPress={() => {
                this.props.navigation.navigate("Update");
              }}
            >
              <Block row>
                <Icon
                  name="edit"
                  family="antdesign"
                  size={20}
                  color={"black"}
                />

                <Text> Update Profile</Text>
              </Block>
            </TouchableOpacity>
          </Block>
          <Block
            center
            row
            style={{
              marginTop: 20,
            }}
          >
            <Text>Private Profile</Text>

            <Switch
              style={{ marginLeft: 10 }}
              color={"tomato"}
              value={this.state.privateProfile}
              onValueChange={() => this.togglePrivateProfile()}
            />
          </Block>
          <Block
            center
            style={{
              backgroundColor: "#f5f5f5",
              width: width * 0.77,
              height: 100,
              borderRadius: 10,
              top: 20,
            }}
          >
            <Block center style={{ marginTop: 15 }}>
              <Text> Show posts from close friends only. </Text>
              <Switch
                style={{ marginTop: 10 }}
                color={"tomato"}
                value={this.state.closeFriendsSelected}
                onValueChange={() => this.toggleSwitch()}
              />
            </Block>
          </Block>
          <Block
            center
            style={{
              backgroundColor: "#f5f5f5",
              width: width * 0.77,
              height: 50,
              borderRadius: 10,
              top: 40,
            }}
          >
            <TouchableOpacity
              style={{ paddingTop: 15 }}
              onPress={() => {
                logOut();
                this.props.navigation.navigate("SignedOut");
              }}
            >
              <Block row>
                <Icon
                  name="logout"
                  family="antdesign"
                  size={20}
                  color={"black"}
                />

                <Text> LogOut</Text>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({});

export default ProfileSettings;
