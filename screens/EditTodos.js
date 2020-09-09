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

class EditTodos extends React.Component {
  //   user = firebase.auth().currentUser;
  //   firestoreUserRef = firebase.firestore().collection("users").doc(this.user.uid);
  //   firestorePostRef = firebase.firestore().collection("posts").doc(this.user.uid)
  //   .collection("userPosts");
  storageRef = firebase.storage().ref();

  state = {
    newTodo: "",
    todos: this.props.navigation.getParam("todos"),
  };

  toggleCheck = (todo) => {
    const todoIndex = this.state.todos.findIndex((item) => item.todo == todo);
    // console.log(item);

    let todosCopy = this.state.todos;
    todosCopy[todoIndex].checked = !todosCopy[todoIndex].checked;
    this.setState({
      todos: todosCopy,
    });

    console.log(this.state.todos);
  };

  renderTodoList = () => {
    // const {name, avatar} = this.props;
    const { params } = this.props.navigation.state;

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
          <ScrollView showsVerticalScrollIndicator={false}>
            {this.state.todos &&
              this.state.todos.map((todo, i) => {
                return (
                  <Block left row key={i}>
                    <Block row left>
                      {todo.checked && (
                        <Checkbox
                          initialValue={true}
                          color="warning"
                          onChange={() => {
                            this.toggleCheck(todo.todo);
                          }}
                          label=""
                          checkboxStyle={{ marginTop: 12 }}
                        />
                      )}
                      {!todo.checked && (
                        <Checkbox
                          initialValue={false}
                          color="warning"
                          onChange={() => {
                            this.toggleCheck(todo.todo);
                          }}
                          label=""
                          checkboxStyle={{ marginTop: 12 }}
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
                    <Block right>
                      <Button
                        onlyIcon
                        icon="minuscircle"
                        iconFamily="antdesign"
                        iconSize={20}
                        color="#f5f5f5"
                        iconColor="tomato"
                        style={{ width: 30, height: 30, marginTop: 8 }}
                        onPress={() => {
                          this.removeTodo(todo);
                        }}
                      ></Button>
                    </Block>
                  </Block>
                );
              })}
          </ScrollView>
          {this.state.todos.length > 0 && (
            <Block style={{ margin: 10 }}>
              <Button
                round
                size="small"
                color="tomato"
                onPress={() => {
                  params.updateTodos(this.state.todos);
                  this.props.navigation.goBack();
                }}
              >
                Save
              </Button>
            </Block>
          )}
        </Block>
      </SafeAreaView>
    );
  };

  addTodo = () => {
    let todos = this.state.todos;
    let newTodo = this.state.newTodo;

    let todoObject = { checked: false, todo: newTodo };
    todos.push(todoObject);
    this.setState({ todos: todos });
  };

  removeTodo = (todo) => {
    const todoIndex = this.state.todos.findIndex((item) => item.todo == todo);
    // console.log(item);

    let todosCopy = this.state.todos;

    todosCopy.splice(todoIndex, 1);

    this.setState({
      todos: todosCopy,
    });

    console.log(this.state.todos);
  };

  textInput = (word) => {
    this.setState({ newTodo: word });
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
            value={this.state.newTodo}
            onChangeText={(word) => this.textInput(word)}
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
            onPress={this.addTodo}
          ></Button>
        </Block>
      </Block>
    );
  };

  render() {
    return (
      <Block flex center>
        <Block flex={1} />
        <Block flex={2}>{this.renderSearchBar()}</Block>
        <Block flex={1} style={{ marginTop: 30, marginBottom: 5 }}>
          <Text h4>Todos: </Text>
        </Block>

        <Block flex={14}>{this.renderTodoList()}</Block>
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
    width: width * 0.9,
    // marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
});

export default EditTodos;
