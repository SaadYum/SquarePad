import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  AsyncStorage,
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
import { ScrollView } from "react-native-gesture-handler";
import { getKeywords } from "../src/CustomFunctions";

const { width, height } = Dimensions.get("screen");

class UpdateProfile extends React.Component {
  user = firebase.auth().currentUser;
  firestoreUserRef = firebase
    .firestore()
    .collection("users")
    .doc(this.user.uid);

  state = {
    username: "",
    bio: "",
    name: "",
    email: "",
  };

  componentWillMount = async () => {
    try {
      let userInfo = await AsyncStorage.getItem("userData");
      let userData = JSON.parse(userInfo);
      console.log(userData);
      if (userData != null) {
        this.setState({
          username: userData.username,
          bio: userData.bio,
          name: userData.name,
          email: userData.email,
        });
      }
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  updateProfile = () => {
    const { username, name, email, bio } = this.state;
    let usernameKeywords = getKeywords(username.toLowerCase());
    let nameKeywords = getKeywords(name.toLowerCase());
    this.firestoreUserRef
      .set(
        {
          username: username,
          name: name,
          email: email,
          bio: bio,
          usernameKeywords: usernameKeywords,
          nameKeywords: nameKeywords,
        },
        { merge: true }
      )
      .then(() => {
        // alert("Profile Info is successfully updated!");
        this.props.navigation.navigate("Profile");
      })
      .catch((err) => {
        alert(err);
      });
  };

  render() {
    return (
      <Block flex middle>
        <StatusBar hidden />
        <Block flex middle>
          <Block style={styles.registerContainer}>
            {/* <Block flex={0.25} middle style={styles.socialConnect}>
                <Text color="#8898AA" size={12}>
                  Sign up with
                </Text>
                <Block row style={{ marginTop: theme.SIZES.BASE }}>
                  <Button style={{ ...styles.socialButtons, marginRight: 30 }}>
                    <Block row>
                      <Icon
                        name="logo-facebook"
                        family="Ionicon"
                        size={14}
                        color={"black"}
                        style={{ marginTop: 2, marginRight: 5 }}
                      />
                      <Text style={styles.socialTextButtons}>FACEBOOK</Text>
                    </Block>
                  </Button>
                  <Button style={styles.socialButtons}>
                    <Block row>
                      <Icon
                        name="logo-google"
                        family="Ionicon"
                        size={14}
                        color={"black"}
                        style={{ marginTop: 2, marginRight: 5 }}
                      />
                      <Text style={styles.socialTextButtons}>GOOGLE</Text>
                    </Block>
                  </Button>
                </Block>
              </Block>
               */}
            <Block flex>
              <ScrollView>
                <Block flex={0.17} middle>
                  <Text color="#8898AA" size={15}>
                    You can change the fields below to update your information.
                  </Text>
                </Block>
                <Block flex center>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    enabled
                  >
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder={this.state.name}
                        onChangeText={(name) => this.setState({ name })}
                        value={this.state.name}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="hat-3"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder={this.state.username}
                        onChangeText={(username) => this.setState({ username })}
                        value={this.state.username}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="hat-3"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>

                    {/* <Block width={width * 0.8}>
                      <Input
                        password
                        borderless
                        placeholder="Password"
                        onChangeText={password => this.setState({ password })}
                        value={this.state.password}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="padlock-unlocked"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                      {/* <Block row style={styles.passwordCheck}>
                        <Text size={12} color={argonTheme.COLORS.MUTED}>
                          password strength:
                        </Text>
                        <Text bold size={12} color={argonTheme.COLORS.SUCCESS}>
                          {" "}
                          strong
                        </Text>
                      </Block> *
                    </Block> */}
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        style={{ height: 100 }}
                        maxLength={60}
                        multiline={true}
                        placeholder={this.state.bio}
                        onChangeText={(bio) => this.setState({ bio })}
                        value={this.state.bio}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="hat-3"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>

                    <Block middle>
                      <Button
                        color="muted"
                        style={styles.createButton}
                        onPress={this.updateProfile}
                      >
                        <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                          UPDATE ACCOUNT
                        </Text>
                      </Button>
                    </Block>
                    <Block middle>
                      {/* <Button
                        color="muted"
                        style={styles.createButton}
                        onPress={() => {
                          this.props.navigation.navigate("Interests");
                        }}
                      >
                        <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                          UPDATE INTERESTS
                        </Text>
                      </Button> */}
                    </Block>
                  </KeyboardAvoidingView>
                </Block>
              </ScrollView>
            </Block>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height * 0.78,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden",
    marginTop: 50,
  },
  socialConnect: {
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#8898AA",
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  socialTextButtons: {
    color: argonTheme.COLORS.INFO,
    fontWeight: "800",
    fontSize: 14,
  },
  inputIcons: {
    marginRight: 12,
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30,
  },
  createButton: {
    width: width * 0.5,
    marginTop: 25,
  },
});

export default UpdateProfile;
