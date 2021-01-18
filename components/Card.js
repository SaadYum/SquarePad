import React from "react";
import { withNavigation } from "react-navigation";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Dimensions,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Block, Text, theme, Input } from "galio-framework";
import Icon from "./Icon";
import * as firebase from "firebase";

import { argonTheme, Images } from "../constants";
import { FlatList } from "react-native-gesture-handler";
import CommentItem from "./CommentItem";
import { Video } from "expo-av";
var width = Dimensions.get("window").width;
var height = Dimensions.get("window").height;

const LikeButton = ({ isLiked, style, navigation, toggleLike }) =>
  isLiked ? (
    <TouchableOpacity style={[styles.button, style]} onPress={toggleLike}>
      <Icon
        family="AntDesign"
        size={24}
        name="like1"
        color={argonTheme.COLORS[isLiked ? "TOMATO" : "BLACK"]}
      />
      <Block middle style={styles.notify} />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={[styles.button, style]} onPress={toggleLike}>
      <Icon
        family="AntDesign"
        size={24}
        name="like2"
        color={argonTheme.COLORS[isLiked ? "TOMATO" : "BLACK"]}
      />
      <Block middle style={styles.notify} />
    </TouchableOpacity>
  );
const CommentButton = ({ isWhite, style, navigation, openCommentInput }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={openCommentInput}>
    <Icon
      family="EvilIcons"
      size={32}
      name="comment"
      color={argonTheme.COLORS[isWhite ? "WHITE" : "BLACK"]}
    />
    <Block middle style={styles.notify} />
  </TouchableOpacity>
);
const ShareButton = ({ isWhite, style, navigation }) => (
  <TouchableOpacity
    style={[styles.button, style]}
    onPress={() => navigation.navigate("Pro")}
  >
    <Icon
      family="EvilIcons"
      size={30}
      name="external-link"
      color={argonTheme.COLORS[isWhite ? "WHITE" : "ICON"]}
    />
    <Block middle style={styles.notify} />
  </TouchableOpacity>
);

const OptionsButton = ({ isWhite, style, navigation, deletePost }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={deletePost}>
    <Icon family="Entypo" size={25} name="dots-three-vertical" color={"grey"} />
    <Block middle style={styles.notify} />
  </TouchableOpacity>
);

class Card extends React.Component {
  user = firebase.auth().currentUser;

  state = {
    likes: 0,
    comments: [],
    ifLiked: false,
    newLikeDocId: "(" + this.user.uid + ")like",
    userId: this.props.item.userId,
    postId: this.props.item.postId,
    commentsArray: [],
    getComments: false,
    openCommentInput: false,
    commentInput: "",
    currentUsername: "",
  };

  firestorePostRef = firebase
    .firestore()
    .collection("posts")
    .doc(this.state.userId)
    .collection("userPosts");

  firestoreUsersRef = firebase.firestore().collection("users");

  firestoreLikeNotificationRef = firebase
    .firestore()
    .collection("notifications")
    .doc(this.state.userId)
    .collection("userNotifications")
    .doc("(" + this.state.postId + ")like+(" + this.user.uid + ")");

  firestoreNotificationsRef = firebase
    .firestore()
    .collection("notifications")
    .doc(this.state.userId)
    .collection("userNotifications");
  // firestorePostRef = firebase.firestore().collection("posts");

  componentDidMount = () => {
    const { item } = this.props;
    // this.setState({userId: item.userId});

    // console.log(this.state.userId+"hkjhjk");
    this.firestorePostRef
      .doc(item.postId)
      .collection("likes")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          this.setState({ likes: querySnapshot.size });
        }
      });

    this.getCommentData();
  };

  // getComments = async()=>{
  //   const{item} = this.props;
  //   var comments = [];

  //    await this.firestorePostRef.doc(item.postId).collection("comments").get().then((querySnapshot)=>{
  //     querySnapshot.forEach((doc)=>{
  //       comments.push(doc.id);
  //     })
  //     this.setState({comments: comments});
  //     console.log("Andar walay comments"+ this.state.comments);

  //   });
  // }

  UNSAFE_componentWillMount = () => {
    const { item } = this.props;

    // console.log(item.image);
    this.getCurrentUsername();
    this.firestorePostRef
      .doc(item.postId)
      .collection("likes")
      .doc(this.state.newLikeDocId)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          this.setState({ ifLiked: true });
        } else {
          this.setState({ ifLiked: false });
        }
      });
  };

  // DOUBLE TAP LIKE
  lastTap = null;
  handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (this.lastTap && now - this.lastTap < DOUBLE_PRESS_DELAY) {
      this.toggleLike();
    } else {
      this.lastTap = now;
    }
  };

  toggleLike = () => {
    const { item } = this.props;

    console.log(this.state.userId);

    if (!this.state.ifLiked) {
      this.setState({ ifLiked: true });
      this.firestorePostRef
        .doc(item.postId)
        .collection("likes")
        .doc(this.state.newLikeDocId)
        .set({
          userId: this.user.uid,
        }) &&
        this.firestoreLikeNotificationRef
          .set({
            content: "liked your post",
            source: this.state.postId,
            time: new Date().getTime(),
            userId: this.user.uid,
            type: "like",
          })
          .then(() => {
            this.state.likes++;
            this.setState({ ifLiked: true });
          });
    } else {
      this.setState({ ifLiked: false });

      this.firestorePostRef
        .doc(item.postId)
        .collection("likes")
        .doc(this.state.newLikeDocId)
        .delete() &&
        this.firestoreLikeNotificationRef.delete().then(() => {
          this.state.likes--;
          this.setState({ ifLiked: false });
        });
    }
  };

  renderButtons = () => {
    const { white, title, navigation } = this.props;
    return (
      <Block row>
        <LikeButton
          key="like-post"
          navigation={navigation}
          toggleLike={this.toggleLike}
          isLiked={this.state.ifLiked}
        />
        <CommentButton
          style={{ paddingLeft: 6 }}
          key="comment-post"
          openCommentInput={this.openCommentInput}
          navigation={navigation}
          isWhite={white}
        />
        {this.props.item.userId == this.user.uid && (
          <OptionsButton
            style={
              this.props.group ? { paddingLeft: 200 } : { paddingLeft: 220 }
            }
            key="option-post"
            deletePost={this.deletePost}
            navigation={navigation}
            isWhite={white}
          />
        )}

        {/* <ShareButton key='share-post' navigation={navigation} isWhite={white} /> */}
      </Block>
    );
  };

  deletePost = async () => {
    if (this.props.group) {
      const selection = await new Promise((resolve) => {
        const title = "Delete!";
        const message = "Confirm";
        const buttons = [
          { text: "Delete", onPress: () => resolve("Delete") },
          { text: "Cancel", onPress: () => resolve(null) },
        ];
        Alert.alert(title, message, buttons);
      });
      if (selection == "Delete") {
        let { item, groupId } = this.props;

        firebase
          .firestore()
          .collection("groups")
          .doc(groupId)
          .collection("discussion")
          .doc(item.postId)
          .delete()
          .then(() => alert("Post Deleted!"));
      }
    } else {
      const selection = await new Promise((resolve) => {
        const title = "Delete!";
        const message = "Confirm";
        const buttons = [
          { text: "Delete", onPress: () => resolve("Delete") },
          { text: "Cancel", onPress: () => resolve(null) },
        ];
        Alert.alert(title, message, buttons);
      });
      if (selection == "Delete") {
        let { item } = this.props;

        firebase
          .firestore()
          .collection("posts")
          .doc(item.userId)
          .collection("userPosts")
          .doc(item.postId)
          .delete()
          .then(() => alert("Post Deleted!"));
      }
    }
  };
  openCommentInput = () => {
    this.setState({ openCommentInput: !this.state.openCommentInput });
  };
  renderCommentInput = () => {
    if (this.state.openCommentInput) {
      return (
        <Block width={width * 0.8} space="between" row>
          <KeyboardAvoidingView behavior="height" enabled>
            <Input
              color="black"
              style={styles.commentBox}
              placeholder="Add a comment..."
              placeholderTextColor={"#8898AA"}
              // onFocus={() => navigation.navigate('Pro')}
              onChangeText={(word) => this.setState({ commentInput: word })}
              value={this.state.commentInput}
            />
          </KeyboardAvoidingView>
          <TouchableOpacity onPress={this.postComment}>
            <Text style={{ paddingTop: 10 }} color="#3a85f0">
              post
            </Text>
          </TouchableOpacity>
        </Block>
      );
    }
  };

  getCurrentUsername() {
    this.firestoreUsersRef
      .doc(this.user.uid)
      .get()
      .then((document) => {
        this.setState({ currentUsername: document.data().username });
      });
  }

  postComment = () => {
    const { item } = this.props;
    let myComment = this.state.commentInput;
    let dateTimestamp = new Date().getTime();
    if (myComment != "") {
      // firebase.firestore().collection("comments").doc(item.postId).collection("userComments").add({

      // }).then((comment)=>{
      //   firebase.firestore().collection("comments").doc(item.postId).collection("userComments").doc(comment.id).set({
      let randId = firebase
        .firestore()
        .collection("comments")
        .doc(item.postId)
        .collection("userComments")
        .doc().id;
      firebase
        .firestore()
        .collection("comments")
        .doc(item.postId)
        .collection("userComments")
        .doc(randId)
        .set({
          commentId: randId,
          username: this.state.currentUsername,
          comment: myComment,
          userId: this.user.uid,
          postUserId: this.state.userId,
        }) &&
        this.firestoreNotificationsRef
          .doc(randId)
          .set({
            content: "commented on your post",
            source: this.state.postId,
            time: dateTimestamp,
            userId: this.user.uid,
            type: "comment",
          })
          .then(async () => {
            alert("DPE");
            let pushToken = "";

            await firebase
              .firestore()
              .collection("users")
              .doc(this.state.userId)
              .get()
              .then((doc) => {
                pushToken = doc.data().push_token;
              });

            this.sendPushNotification(
              this.state.currentUsername,
              "Commented: " + myComment,
              pushToken
            );
            this.setState({ openCommentInput: false, commentInput: "" });

            this.getCommentData();
          });
    }
  };

  sendPushNotification = async (title, body, pushToken) => {
    const message = {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: { data: "goes here" },
      ios: { _displayInForeground: true },
      _displayInForeground: true,
    };
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  renderLikes = () => {
    if (this.state.likes > 0) {
      return (
        <Block style={{ flex: 1, paddingTop: 6 }}>
          <Block row>
            <Text size={14}> {this.state.likes} likes</Text>
            {/* <Text size={14} > Comments</Text> */}
          </Block>
        </Block>
      );
    }
  };

  getCommentData() {
    let commArray = [];
    const { item } = this.props;
    // this.firestorePostRef.doc(this.state.userId).collection("userPosts").doc(this.props.item.postId).collection("comments").
    //POST K hisab sa lao
    firebase
      .firestore()
      .collection("comments")
      .doc(item.postId)
      .collection("userComments")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          commArray.push(doc.data());

          // console.log(doc.data()+commArray);
        });
        this.setState({ commentsArray: commArray });
      })
      .catch((err) => {
        alert(err);
      });
  }

  renderComments = () => {
    const { navigation } = this.props;
    if (this.state.getComments) {
      if (this.state.commentsArray.length) {
        console.log(this.state.commentsArray);

        return (
          <Block style={{ flex: 1, paddingTop: 6 }}>
            <Block>
              <FlatList
                data={this.state.commentsArray}
                renderItem={({ item }) => (
                  <CommentItem
                    updateComments={this.getCommentData}
                    comment={item}
                    postId={this.props.item.postId}
                    userId={this.state.userId}
                    navigation={navigation}
                  />
                )}
                keyExtractor={(item) => item.commentId}
              />
            </Block>
          </Block>
        );
      }
    }
  };

  renderCaption() {
    const { item } = this.props;
    if (item.caption != "") {
      return (
        <Block flex space="between" style={styles.cardDescription}>
          <Text size={14} italic style={styles.cardTitle}>
            {item.caption}
          </Text>
          {/* <Text size={12} muted={!ctaColor} color={ctaColor || argonTheme.COLORS.ACTIVE} bold>{item.cta}</Text> */}
        </Block>
      );
    }
  }

  renderOptions = () => {};
  renderAvatar() {
    const { avatar, styles, item } = this.props;
    // if (!item.avatar) return null;
    return <Image source={{ uri: item.avatar }} style={styles.avatar} />;
  }

  renderLocation() {
    const { location, locationColor, theme, item } = this.props;
    if (!item.location) return null;

    if (typeof item.location !== "string") {
      return item.location;
    }

    return (
      <Block row right>
        <Icon
          name="map-pin"
          family="feather"
          color={locationColor || argonTheme.COLORS.MUTED}
          size={argonTheme.SIZES.FONT}
        />
        <Text
          muted
          size={argonTheme.SIZES.FONT * 0.875}
          color={locationColor || argonTheme.COLORS.MUTED}
          style={{ marginLeft: argonTheme.SIZES.BASE * 0.25 }}
        >
          {item.location}
        </Text>
      </Block>
    );
  }

  render() {
    const {
      navigation,
      item,
      horizontal,
      full,
      style,
      ctaColor,
      group,
      imageStyle,
    } = this.props;

    const imageStyles = [
      // full ? styles.fullImage : styles.horizontalImage,
      group ? styles.fullImage2 : styles.fullImage,
      imageStyle,
    ];
    const cardContainer = [styles.card, style];
    const imgContainer = [
      styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles,
      // styles.shadow,
    ];

    return (
      <Block>
        <Block row={horizontal} card flex style={cardContainer}>
          <Block row style={{ flex: 1, paddingBottom: 12, paddingTop: 12 }}>
            <Block>
              <TouchableWithoutFeedback
                onPress={() =>
                  navigation.navigate("userProfile", {
                    userId: this.state.userId,
                  })
                }
              >
                {this.renderAvatar()}
              </TouchableWithoutFeedback>
            </Block>
            <Block>
              <TouchableWithoutFeedback
                onPress={() =>
                  navigation.navigate("userProfile", {
                    userId: this.state.userId,
                  })
                }
              >
                <Text size={16} bold style={styles.cardUser}>
                  {item.username}
                </Text>
              </TouchableWithoutFeedback>
            </Block>
            <Block
              style={{
                flex: 1,
                paddingBottom: 12,
                flexDirection: "row-reverse",
              }}
            >
              {this.renderLocation()}
            </Block>
          </Block>
          <View></View>
          <TouchableWithoutFeedback onPress={this.handleDoubleTap}>
            {/* <Block flex style={imgContainer}> */}
            <Block flex center>
              {item.type != "video" ? (
                <Image source={{ uri: item.image }} style={imageStyles} />
              ) : (
                <Video
                  source={{
                    uri: item.Video,
                    // "http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
                  }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay
                  // isLooping
                  // useNativeControls
                  style={{
                    width: width * 0.8,
                    height: width * 0.5,
                    borderRadius: 15,
                  }}
                />
              )}
            </Block>
          </TouchableWithoutFeedback>
          <Block style={{ flex: 1, paddingTop: 12 }}>
            {this.renderButtons()}
          </Block>
          {this.renderLikes()}

          <TouchableWithoutFeedback>
            <Block>{this.renderCaption()}</Block>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            onPress={() =>
              this.setState({ getComments: !this.state.getComments })
            }
          >
            <Text muted> Comments</Text>
          </TouchableOpacity>
          {this.renderCommentInput()}
          {this.renderComments()}
        </Block>
      </Block>
    );
  }
}

Card.defaultProps = {
  styles: {
    avatar: {
      width: theme.SIZES.CARD_AVATAR_WIDTH,
      height: theme.SIZES.CARD_AVATAR_HEIGHT,
      borderRadius: theme.SIZES.CARD_AVATAR_RADIUS,
    },
  },
};

Card.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 100,
    marginBottom: 0,
  },
  cardTitle: {
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 2,
  },
  commentBox: {
    height: 24,
    width: width * 0.7,
    // marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  cardUser: {
    // fontFamily: 'Arial',
    fontWeight: "400",
    paddingTop: 12,
    paddingLeft: 4,
    color: theme.COLORS.BLACK,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 122,
    width: "auto",
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderRadius: 15,
  },
  fullImage2: {
    height: height * 0.4,
    width: width * 0.75,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: theme.COLORS.TRANSPARENT,
  },
  fullImage: {
    height: height * 0.5,
    width: width * 0.8,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: theme.COLORS.TRANSPARENT,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 0,
    elevation: 2,
  },
});

export default withNavigation(Card);
