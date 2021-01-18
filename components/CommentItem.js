import React from "react";
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

class CommentItem extends React.Component {
  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePostRef = firebase.firestore().collection("posts");
  firestoreNotificationsRef = firebase
    .firestore()
    .collection("notifications")
    .doc(this.props.userId)
    .collection("userNotifications");
  state = {
    avatar: Images.ProfilePicture,
    username: "",
    comment: "",
    commentDeleted: false,
    // isLoading : false,
  };
  componentWillMount = () => {
    this.getCurrentUsername();
  };

  deleteComment = async () => {
    const { comment, postId } = this.props;
    const selection = await new Promise((resolve) => {
      const title = "Delete!";
      const message = "Do you want to delete the comment!";
      const buttons = [
        { text: "Yes", onPress: () => resolve("Delete") },
        { text: "Cancel", onPress: () => resolve(null) },
      ];
      Alert.alert(title, message, buttons);
    });
    if (selection == "Delete") {
      if (comment.username == this.state.currentUsername) {
        firebase
          .firestore()
          .collection("comments")
          .doc(postId)
          .collection("userComments")
          .doc(comment.commentId)
          .delete() &&
          this.firestoreNotificationsRef
            .doc(comment.commentId)
            .delete()
            .then(() => {
              alert("Comment Deleted!");
              this.setState({ commentDeleted: true });
            })
            .catch((err) => {
              alert(err);
            });
      }
    }
  };
  getCurrentUsername() {
    this.firestoreUsersRef
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((document) => {
        this.setState({ currentUsername: document.data().username });
      });
  }

  componentDidMount() {
    const { comment, navigation, userId } = this.props;

    this.setState({ comment: comment, userId: userId });
  }

  render() {
    const { comment, navigation, userId } = this.props;
    if (!this.state.commentDeleted) {
      return (
        <Block>
          <Block row style={{ flex: 1, paddingBottom: 1, paddingTop: 1 }}>
            <Block>
              <TouchableWithoutFeedback
                onPress={() =>
                  navigation.navigate("userProfile", { userId: userId })
                }
              >
                <Text size={12} style={styles.cardUser}>
                  {" "}
                  {comment.username}
                </Text>
              </TouchableWithoutFeedback>
            </Block>
            <TouchableOpacity onLongPress={this.deleteComment}>
              <Block fluid style={styles.comment}>
                <Text italic size={10} color="#1c1c1c">
                  {comment.comment}
                </Text>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>
      );
    } else return null;
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
    // fontFamily: 'Arial',
    fontWeight: "400",
    paddingTop: 8,
    paddingLeft: 4,
    color: argonTheme.COLORS.BLACK,
  },
});

export default CommentItem;
