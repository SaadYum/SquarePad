import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import PropTypes from "prop-types";
import { Button, Block, Text } from "galio-framework";
import * as firebase from "firebase";

import argonTheme from "../constants/Theme";
import { Images } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GiftedChat, Bubble } from "react-native-gifted-chat";

class PlanChat extends React.Component {
  currentUserId = firebase.auth().currentUser.uid;
  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePlanChatRef = firebase
    .firestore()
    .collection("planChats")
    .doc(this.props.navigation.getParam("planId"))
    .collection("chat");

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      currentPlanRef: "",
      members: [
        {
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2F(YEdueU8JCRWCgIcBXvTcfOF1wo72)ProfilePic?alt=media&token=69135050-dec6-461d-bc02-487766e1c81d",
          name: "Asim",
          userId: this.currentUserId,
        },
      ],
    };
    this.onSend = this.onSend.bind(this);
  }

  UNSAFE_componentWillMount = () => {
    this.setState(
      {
        // currentPlanRef: this.firestorePlanRef.doc(this.props.navigation.getParams("planId"))
        //   members: this.props.navigation.getParams("members"),
        members: [
          //   {
          //     avatar:
          //       "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2F(YEdueU8JCRWCgIcBXvTcfOF1wo72)ProfilePic?alt=media&token=69135050-dec6-461d-bc02-487766e1c81d",
          //     name: "Saad",
          //     userId: "YEdueU8JCRWCgIcBXvTcfOF1wo72",
          //   },
          //   {
          //     avatar:
          //       "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2F(YEdueU8JCRWCgIcBXvTcfOF1wo72)ProfilePic?alt=media&token=69135050-dec6-461d-bc02-487766e1c81d",
          //     name: "Asim",
          //     userId: this.currentUserId,
          //   },
          ...this.state.members.concat(
            this.props.navigation.getParam("members")
          ),
          //   {
          //     avatar:
          //       "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2F(YEdueU8JCRWCgIcBXvTcfOF1wo72)ProfilePic?alt=media&token=69135050-dec6-461d-bc02-487766e1c81d",
          //     name: "Asim",
          //     userId: this.currentUserId,
          //   },
        ],
        currentPlanRef: this.firestorePlanChatRef.doc("CD6UkqKctZmhhhlLUG7p"),
        messages: [
          // {
          //   _id: Math.round(Math.random() * 1000000),
          //   text: "Hello 2",
          //   createdAt: new Date(),
          //   user: {
          //     _id: 3,
          //     name: "Another User",
          //     avatar: Images.ProfileBackground,
          //   },
          // },
        ],
      },
      () => {
        console.log(this.state.members);
        this.assignMemberIds();
      }
    );
  };

  componentDidMount = () => {
    this.listenMessages();
  };

  assignMemberIds = () => {
    let members = this.state.members;
    let ids = [];
    let index = 2;
    members.map((member) => {
      member.id = index;
      index++;
    });
    this.setState({ members: members });
  };

  listenMessages = () => {
    let newMessages = [];
    this.firestorePlanChatRef.onSnapshot((snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type == "added") {
          newMessages.push(change.doc.data());
          this.onReceive(change.doc.data());
        }
      });

      //   let changes = snap.docChanges().filter((change) => {
      //     return change.type === "modified";
      //   });

      //   changes.map((change) => {
      //     newMessages.push(change.doc.data());
      //   });

      console.log(newMessages);

      //   this.setState({ messages: newMessages });
      //   if (newMessages.length) {
      //     alert("Yess");
      //     newMessages.map((message) => {
      //       this.onReceive(message);
      //     });
      //   }
    });
  };

  onSend = (messages = []) => {
    // this.setState(
    //   (previousState) => {
    //     return {
    //       messages: GiftedChat.append(previousState.messages, messages),
    //     };
    //   },
    //   () => {
    messages[0].createdAt = messages[0].createdAt.toString();
    // messages[0].user._id = "YEdueU8JCRWCgIcBXvTcfOF1wo72";
    // messages[0].user.name = "Saad";
    this.uploadMessage(messages[0]);
    //   }
    // );
  };

  uploadMessage = (message) => {
    this.firestorePlanChatRef
      .doc(message._id)
      .set(message)
      .then(() => {
        console.log("Upload");
      })
      .catch(() => {
        alert("Message not sent. Try Again!");
      });
  };

  onReceive = (message) => {
    console.log(this.state.messages);

    let members = this.state.members;

    let member = members.find((member) => {
      return member.userId == message.user._id;
    });
    let id = member.userId;
    let name = member.username;
    let avatar = member.avatar;

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
        }),
      };
    });
  };

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        user={{
          _id: this.currentUserId,
        }}
      />
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

export default PlanChat;
