import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import PropTypes from "prop-types";
import { Button, Block, Text } from "galio-framework";
import * as firebase from "firebase";

import argonTheme from "../constants/Theme";
import { Images } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GiftedChat, Bubble, Actions } from "react-native-gifted-chat";
import { CreateUser } from "../services/auth.service";
import CustomActions from "./CustomActions";

const { width } = Dimensions.get("screen");
const { height } = Dimensions.get("screen");

class Chat extends React.Component {
  currentUserId = firebase.auth().currentUser.uid;
  firestoreUsersRef = firebase.firestore().collection("users");
  storageRef = firebase.storage().ref();

  secondUserId = this.props.navigation.getParam("userId");
  groupChatId = null;
  firestoreMessagesRef = null;

  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      currentPlanRef: "",
      secondUser: {},
      groupChatId: this.currentUserId + "-" + this.secondUserId,
      firestoreMessagesRef: "",
    };
    this.onSend = this.onSend.bind(this);
  }

  getMembersData = async (callback) => {
    this.firestoreUsersRef
      .doc(this.secondUserId)
      .get()
      .then((doc) => {
        let userObj = {
          name: doc.data().username,
          userId: doc.id,
        };
        let profilePic = this.storageRef.child(
          "profilePics/(" + doc.id + ")ProfilePic"
        );
        profilePic.getDownloadURL().then((url) => {
          userObj.avatar = url;

          this.setState({ secondUser: userObj }, callback());
        });
      });
  };

  adjustGroupChatId = (callback) => {
    if (this.currentUserId <= this.secondUserId) {
      this.groupChatId = `${this.currentUserId}-${this.secondUserId}`;
      this.firestoreMessagesRef = firebase
        .firestore()
        .collection("messages")
        .doc(this.groupChatId)
        .collection("msg");
      console.log(this.groupChatId);
    } else {
      this.groupChatId = `${this.secondUserId}-${this.currentUserId}`;
      this.firestoreMessagesRef = firebase
        .firestore()
        .collection("messages")
        .doc(this.groupChatId)
        .collection("msg");
      console.log(this.groupChatId);
    }

    callback();
  };

  adjustGroupChatId2 = async (callback) => {
    let currentUserId = this.currentUserId;
    let secondUserId = this.secondUserId;
    let groupChatId = this.state.groupChatId;

    return await firebase
      .firestore()
      .collection("messages")
      .doc(groupChatId)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          //   this.currentUserId = secondUserId;
          //   this.secondUserId = currentUserId;
          groupChatId = this.secondUserId + "-" + this.currentUserId;
          this.setState(
            {
              groupChatId: groupChatId,
              firestoreMessagesRef: firebase
                .firestore()
                .collection("messages")
                .doc(groupChatId)
                .collection("msg"),
            },
            callback()
            // console.log("GROUP CHAT ID: ", this.state.groupChatId)
          );
        } else {
          this.setState(
            {
              firestoreMessagesRef: firebase
                .firestore()
                .collection("messages")
                .doc(groupChatId)
                .collection("msg"),
            },
            callback()
            // console.log("GROUP CHAT ID: ", this.state.groupChatId)
          );
        }
      });
  };

  UNSAFE_componentWillMount = () => {
    this.adjustGroupChatId(() => {
      this.getMembersData(() => {
        console.log(this.state.secondUser);
        this.listenMessages();
      });
    });
    // this.assignMemberIds();
  };

  //   componentDidMount = () => {
  //     this.listenMessages();
  //   };

  //   componentDidMount = () => {
  //     this.listenMessages();
  //   };
  listenMessages = () => {
    let newMessages = [];
    // let firestoreMessagesRef = this.state.firestoreMessagesRef;
    this.firestoreMessagesRef.onSnapshot((snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type == "added") {
          newMessages.push(change.doc.data());
          let docData = change.doc.data();

          let message = {
            _id: change.doc.id,
            createdAt: new Date(parseInt(docData.timestamp)).toString(),
            text: docData.content,
            user: {
              _id: docData.idFrom,
            },
            image: typeof docData.image != "undefined" ? docData.image : "",
          };
          this.onReceive(message);
        }
      });

      //   console.log(newMessages);
    });
  };

  onSend = (messages = []) => {
    // this.setState((previousState) => {
    //   return {
    //     messages: GiftedChat.append(previousState.messages, messages),
    //   };
    // });
    messages[0].createdAt = messages[0].createdAt.toString();
    this.uploadMessage(messages[0]);
  };

  uploadMediaMessage = (url) => {
    let message = {
      // text: "image",
      image: url,
      type: 1,
    };
    this.uploadMessage(message);
  };

  uploadMessage = (message) => {
    let timestamp = new Date().getTime().toString();
    message._id = timestamp;

    if (message.type == 1) {
      this.firestoreMessagesRef
        .doc(timestamp)
        .set({
          // content: message.text,
          idFrom: this.currentUserId,
          idTo: this.secondUserId,
          timestamp: timestamp,
          image: message.image,
          type: 1,
        })
        .then(() => {
          console.log("Uploaded");
        })
        .catch(() => {
          alert("Message not sent. Try Again!");
        });
    } else {
      // let firestoreMessagesRef = this.state.firestoreMessagesRef;
      this.firestoreMessagesRef
        .doc(timestamp)
        .set({
          content: message.text,
          idFrom: this.currentUserId,
          idTo: this.secondUserId,
          timestamp: timestamp,
          type: 0,
        })
        .then(() => {
          console.log("Uploaded");
        })
        .catch(() => {
          alert("Message not sent. Try Again!");
        });
    }
  };

  onReceive = (message) => {
    // console.log(this.state.messages);
    console.log(message);
    let secondUser = this.state.secondUser;
    let id = secondUser.userId;
    let name = secondUser.username;
    let avatar = secondUser.avatar;

    if (message.user._id != this.currentUserId) {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, {
            _id: message._id,
            text: message.text,
            createdAt: message.createdAt,
            user: {
              _id: id,
              name: name,
              avatar: avatar,
            },
            image: message.image,
          }),
        };
      });
    } else {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, {
            _id: message._id,
            text: message.text,
            createdAt: message.createdAt,
            user: {
              _id: this.currentUserId,
            },

            image: message.image,
          }),
        };
      });
    }
  };
  renderCustomActions(props) {
    return (
      <CustomActions
        {...props}
        uploadMediaMessage={props.uploadMediaMessage}
        onSend={props.onSend}
      />
    );

    // const options = {
    //   "Action 1": (props) => {
    //     alert("option 1");
    //   },
    //   "Action 2": (props) => {
    //     alert("option 2");
    //   },
    //   Cancel: () => {},
    // };
    // return <Actions {...props} options={options} />;
  }

  render() {
    return (
      <Block style={{ paddingBottom: 10 }} flex>
        {/* <Block flex={8}> */}
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend}
          uploadMediaMessage={this.uploadMediaMessage}
          renderActions={this.renderCustomActions}
          user={{
            _id: this.currentUserId,
          }}
        />
        {/* </Block> */}
        {/* <Block flex={1}>
          <Text>new dssdsj</Text>
        </Block> */}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  smallButton: {
    width: 150,
    height: 30,
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  comment: {
    flex: 1,
    paddingTop: 8,
    paddingLeft: 10,
    marginLeft: 5,
    height: 28,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fcfcfc",
    borderColor: "#fcfcfc",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0,
  },
  cardUsername: {
    paddingTop: 4,
  },
  cardUser: {
    fontFamily: "Arial",
    fontWeight: "400",
    paddingTop: 8,
    paddingLeft: 4,
    color: argonTheme.COLORS.BLACK,
  },
});

export default Chat;
