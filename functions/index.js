const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;
admin.initializeApp();

const sendPushNotification = async (title, body, pushToken) => {
  const message = {
    to: pushToken,
    sound: "default",
    title: title,
    body: body,
    data: { title: title, body: body },
    ios: { _displayInForeground: true },
    _displayInForeground: true,
  };

  // const body = JSON.stringify(message);
  const response = await axios.post(
    "https://exp.host/--/api/v2/push/send",
    JSON.stringify(message),
    {
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Notification Pushed with data:", message);

  return "Notification Pushed with data:", message;
};

exports.listenComments = functions.firestore
  .document("comments/{postId}/userComments/{userCommentId}")
  .onCreate((doc, context) => {
    const comment = doc.data();
    const notification = {
      type: "comment",
      content: "commented on your post",
      postId: `${context.params.postId}`,
      user: `${comment.username}`,
      userId: `${comment.userId}`,
      postUserId: `${comment.postUserId}`,
      time: admin.firestore.FieldValue.serverTimestamp(),
    };

    admin
      .firestore()
      .collection("users")
      .doc(comment.postUserId)
      .get()
      .then((doc) => {
        let user = doc.data();
        return sendPushNotification(
          user.username,
          "commented: " + comment.comment,
          user.push_token
        );
      });
  });

exports.listenLikes = functions.firestore
  .document("posts/{userId}/userPosts/{postId}/likes/{likeId}")
  .onCreate((doc, context) => {
    const like = doc.data();
    admin
      .firestore()
      .collection("users")
      .doc(context.params.userId)
      .get()
      .then((doc) => {
        const notification = {
          type: "like",
          content: "liked your post",
          postId: `${context.params.postId}`,
          user: `${doc.data().username}`,
          userId: `${like.userId}`,
          postUserId: `${context.params.userId}`,
          time: admin.firestore.FieldValue.serverTimestamp(),
        };
        console.log("NOTIFICATION", notification);
        let user = doc.data();
        return sendPushNotification(
          user.username,
          "liked your post ",
          user.push_token
        );
      });
  });

exports.listenPosts = functions.firestore
  .document("posts/{userId}/userPosts/{postId}")
  .onUpdate((doc, context) => {
    const post = doc.data();
    admin
      .firestore()
      .collection("users")
      .doc(context.params.userId)
      .collection("followedBy")
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          admin
            .firestore()
            .collection("timeline")
            .doc(doc.id)
            .collection("timelinePosts")
            .add(post);
        });
      });
  });
