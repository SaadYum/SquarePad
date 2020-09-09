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
import { signInWithGoogleAsync } from "../services/googleAuth";

const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  state = {
    username: "",
    bio: "",
    name: "",
    email: "",
    password: "",
  };

  componentDidMount() {
    isUserSignedIn();
  }

  //AsynchStorage for pre loggin for already logged in users
  async storeToken(user) {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(user));
    } catch (error) {
      console.log("Something went wrong", error);
    }
  }

  //Calling the AsynchStorage
  onRegister = () => {
    const { username, name, email, password, bio } = this.state;
    console.log(username, name, email, password, bio);
    CreateUser(username, name, email, password, bio)
      .then(() => {
        SigninUser(email, password)
          .then((res) => {
            firestoreUserRef = firebase
              .firestore()
              .collection("users")
              .doc(res.user.uid)
              .get()
              .then((doc) => {
                const userObj = doc.data();
                this.storeToken(userObj);
                this.props.navigation.navigate("SignedIn");
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            alert(err);
            console.log(err);
          });
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });
  };

  render() {
    return (
      <Block flex middle>
        <StatusBar hidden />
        <Block flex middle>
          <Block style={styles.registerContainer}>
            <Block flex={0.25} middle style={styles.socialConnect}>
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

            <Block flex>
              <ScrollView>
                <Block flex={0.17} middle>
                  <Text color="#8898AA" size={12}>
                    Or sign up the classic way
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
                        placeholder="Name"
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
                        placeholder="UserName"
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
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Email"
                        onChangeText={(email) => this.setState({ email })}
                        value={this.state.email}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ic_mail_24px"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>

                    <Block width={width * 0.8}>
                      <Input
                        password
                        borderless
                        placeholder="Password"
                        onChangeText={(password) => this.setState({ password })}
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
                      </Block> */}
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        style={{ height: 100 }}
                        maxLength={60}
                        multiline={true}
                        placeholder="Bio"
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
                    <Block row width={width * 0.75}>
                      <Checkbox
                        checkboxStyle={{
                          borderWidth: 3,
                        }}
                        color={argonTheme.COLORS.INFO}
                        label="I agree with the"
                      />
                      <Button
                        style={{ width: 100 }}
                        color="transparent"
                        textStyle={{
                          color: argonTheme.COLORS.INFO,
                          fontSize: 14,
                        }}
                      >
                        Privacy Policy
                      </Button>
                    </Block>
                    <Block middle>
                      <Button
                        color="muted"
                        style={styles.createButton}
                        onPress={this.onRegister}
                      >
                        <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                          CREATE ACCOUNT
                        </Text>
                      </Button>
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

export default Register;
