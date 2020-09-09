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
} from "react-native";
import { Block, Text, theme, Input, Checkbox } from "galio-framework";
import { Card, ListItem } from "react-native-elements";

import { Button, Icon } from "../components";
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

class PlanDetails extends React.Component {
  storageRef = firebase.storage().ref();
  user = firebase.auth().currentUser;
  state = {
    newTodo: "",
    todos: this.props.navigation.getParam("plan").todos,
    plan: this.props.navigation.getParam("plan"),
    members: [],
  };

  UNSAFE_componentWillMount = () => {
    let members = this.state.plan.members;
    members = members.filter((member) => member.userId != this.user.uid);
    this.setState({ members: members });
  };

  renderTodoList = () => {
    // const {name, avatar} = this.props;
    const { params } = this.props.navigation.state;

    return (
      <SafeAreaView>
        <Block
          center
          style={{
            width: width * 0.8,
            backgroundColor: "#f5f5f5",
            borderRadius: 10,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {this.state.todos &&
              this.state.todos.map((todo, i) => {
                return (
                  <Block left row key={i}>
                    <Block row left>
                      {todo.checked && (
                        <Icon
                          family="AntDesign"
                          style={{ top: 13 }}
                          size={20}
                          color={"grey"}
                          name="checkcircle"
                        />
                      )}
                      {!todo.checked && (
                        <Icon
                          family="AntDesign"
                          style={{ top: 13 }}
                          size={20}
                          color={"grey"}
                          name="checkcircleo"
                        />
                      )}
                      <ListItem
                        containerStyle={{
                          width: width * 0.7,
                          backgroundColor: "#f5f5f5",
                        }}
                        title={todo.todo}
                      />
                    </Block>
                  </Block>
                );
              })}
          </ScrollView>
        </Block>
      </SafeAreaView>
    );
  };

  renderMembersList = () => {
    return (
      <Block
        center
        style={{
          width: width * 0.8,
          backgroundColor: "#f7f7f7",
          borderRadius: 10,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.members &&
            this.state.members.map((u, i) => {
              return (
                <Block left row key={i}>
                  <ListItem
                    containerStyle={{
                      width: width * 0.6,
                      backgroundColor: "#f7f7f7",
                      borderRadius: 10,
                    }}
                    title={u.name}
                    leftAvatar={{ source: { uri: u.avatar } }}
                  />
                </Block>
              );
            })}
        </ScrollView>
      </Block>
    );
  };

  renderSpots = () => {
    return (
      <Block
        center
        style={{
          width: width * 0.8,
          backgroundColor: "#f7f7f7",
          borderRadius: 10,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.plan.spots &&
            this.state.plan.spots.map((spot, i) => {
              return (
                <Block left row key={i}>
                  <Block row left>
                    <ListItem
                      containerStyle={{
                        width: width * 0.6,
                        backgroundColor: "#f7f7f7",
                      }}
                      title={spot.name}
                    />
                  </Block>
                </Block>
              );
            })}
        </ScrollView>
      </Block>
    );
  };

  render() {
    return (
      <Block flex center>
        {/* <Block flex={1} /> */}
        <Block flex={1} row style={{ marginTop: 10, marginBottom: 10 }}>
          <Button
            style={{ borderRadius: 30, width: 100, height: 35 }}
            size="small"
            color="tomato"
            onPress={() => {
              let plan = this.state.plan;
              this.props.navigation.navigate("StartTour", {
                destination: plan.location,
                destinationId: plan.destination_id,
                members: plan.members,
                destinationName: plan.destination,
                spots: plan.spots,
                planId: plan.id,
                creatorId: plan.creatorId,
              });
            }}
          >
            Tour
          </Button>
          {this.state.plan.creatorId == this.user.uid && (
            <Button
              style={{ left: 3, borderRadius: 30, width: 100, height: 35 }}
              size="small"
              color="tomato"
              onPress={() => {
                this.props.navigation.navigate("EditPlan", {
                  plan: this.state.plan,
                });
              }}
            >
              Edit Plan
            </Button>
          )}
          {this.state.plan.creatorId == this.user.uid && (
            <Button
              style={{ left: 7, borderRadius: 30, width: 100, height: 35 }}
              size="small"
              color="tomato"
              onPress={() => {
                this.props.navigation.navigate("PlanJoinRequests", {
                  plan: this.state.plan,
                });
              }}
            >
              Join Requests
            </Button>
          )}
        </Block>

        <Block flex={14} center>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Block>
              <Block flex={1} style={{ marginBottom: 2 }}>
                <Text h5>Todos: </Text>
              </Block>

              <Block flex={6}>{this.renderTodoList()}</Block>
            </Block>
            <Block>
              <Block flex={1}>
                <Block flex={1} style={{ marginBottom: 2 }}>
                  <Text h5>Members: </Text>
                </Block>

                <Block flex={7}>{this.renderMembersList()}</Block>
              </Block>
              <Block flex={1}>
                <Block flex={1} style={{ marginTop: 5, marginBottom: 2 }}>
                  <Text h5>Nearby Spots: </Text>
                </Block>

                <Block flex={4}>{this.renderSpots()}</Block>
              </Block>
            </Block>
          </ScrollView>
        </Block>
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
});

export default PlanDetails;
