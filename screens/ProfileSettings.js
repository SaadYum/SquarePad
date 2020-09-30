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
} from "../services/auth.service";
import { Block, Checkbox, Text, theme } from "galio-framework";
import * as firebase from "firebase";

import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("screen");

class ProfileSettings extends React.Component {
  componentWillMount = async () => {};

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
            style={{
              backgroundColor: "#f5f5f5",
              width: width * 0.77,
              height: 50,
              borderRadius: 10,
              top: 20,
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
                  name="logout"
                  family="antdesign"
                  size={20}
                  color={"black"}
                />

                <Text> Log Out</Text>
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
