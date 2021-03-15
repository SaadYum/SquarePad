import React from "react";
//fake comment
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  AsyncStorage,
} from "react-native";
import * as firebase from "firebase";
import { Block, Checkbox, Text, theme } from "galio-framework";
import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { SigninUser, isUserSignedIn } from "../services/auth.service";
import { getKeywords } from "../src/CustomFunctions";

const { width, height } = Dimensions.get("screen");

class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    email: "",
    password: "",
  };

  //AsynchStorage for pre loggin for already logged in users
  async storeToken(user) {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(user));
    } catch (error) {
      console.log("Something went wrong", error);
    }
  }

  onLogin = () => {
    const { email, password } = this.state;
    console.log(email, password);
    SigninUser(email, password)
      .then((res) => {
        firestoreUserRef = firebase
          .firestore()
          .collection("users")
          .doc(res.user.uid)
          .get()
          .then((doc) => {
            let username = doc.data().username;
            let usernameKeywords = getKeywords(username);

            firebase.firestore().collection("users").doc(res.user.id).set(
              {
                usernameKeywords: usernameKeywords,
              },
              { merge: true }
            );

            const userObj = doc.data();
            userObj.uid = res.user.uid;
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
  };

  render() {
    const { navigation } = this.props;

    return (
      <Block flex middle>
        <StatusBar hidden />
        <Block flex middle>
          <Block style={styles.registerContainer}>
            <Block flex={0.25} middle style={styles.socialConnect}>
              <Text color="#8898AA" size={12}>
                Log In with
              </Text>
              <Block row style={{ marginTop: theme.SIZES.BASE }}>
                <Button
                  style={{ ...styles.socialButtons, marginRight: 30 }}
                  onPress={() => {
                    alert("This feature is under construction.");
                  }}
                >
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
                <Button
                  style={styles.socialButtons}
                  onPress={() => {
                    alert("This feature is under construction.");
                  }}
                >
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
                <Block
                  flex={0.17}
                  style={{ marginTop: 20, marginBottom: 10 }}
                  middle
                >
                  <Text color="#8898AA" size={12}>
                    Or Log In with the Travy account.
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
                    </Block>

                    <Block middle>
                      <Button
                        color="muted"
                        style={styles.createButton}
                        onPress={this.onLogin}
                      >
                        <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                          LOG IN
                        </Text>
                      </Button>
                    </Block>
                    <Block row style={styles.passwordCheck}>
                      <Text size={12} color={argonTheme.COLORS.MUTED}>
                        Don't have an account!
                      </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Register")}
                      >
                        <Text bold size={12} color={argonTheme.COLORS.SUCCESS}>
                          Sign Up
                        </Text>
                      </TouchableOpacity>
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
    marginTop: 10,
  },
});

export default Login;
