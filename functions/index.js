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

exports.listenWritePost = functions.firestore
  .document("posts/{userId}/userPosts/{postId}")
  .onWrite((change, context) => {
    const post = change.after.data();
    console.log("POST Written", post);
    if (change.after.exists) {
      admin
        .firestore()
        .collection("users")
        .doc(context.params.userId)
        .get()
        .then((postUser) => {
          let postUserData = postUser.data();

          return admin
            .firestore()
            .collection("users")
            .doc(context.params.userId)
            .collection("followedBy")
            .get()
            .then((docs) => {
              docs.forEach((user) => {
                admin
                  .firestore()
                  .collection("users")
                  .doc(user.id)
                  .get()
                  .then((doc) => {
                    let data = doc.data();
                    post.userId = context.params.userId;
                    post.userAvatar = postUserData.profilePic;
                    post.username = postUserData.username;

                    admin
                      .firestore()
                      .collection("timeline")
                      .doc(user.id)
                      .collection("timelinePosts")
                      .doc(context.params.postId)
                      .set(post);
                  });
              });
            });
        });
    } else {
      return admin
        .firestore()
        .collection("users")
        .doc(context.params.userId)
        .collection("followedBy")
        .get()
        .then((docs) => {
          docs.forEach((user) => {
            admin
              .firestore()
              .collection("timeline")
              .doc(user.id)
              .collection("timelinePosts")
              .doc(context.params.postId)
              .delete();
          });
        });
    }
  });

exports.listenFollow = functions.firestore
  .document("users/{userId}/following/{followingId}")
  .onWrite((change, context) => {
    const following = change.after.data();
    console.log("Following Added", following);

    if (change.after.exists) {
      admin
        .firestore()
        .collection("users")
        .doc(change.after.id)
        .get()
        .then((user) => {
          let data = user.data();
          let username = data.username;
          let userId = user.id;
          let userAvatar = data.profilePic;

          return admin
            .firestore()
            .collection("posts")
            .doc(change.after.id)
            .collection("userPosts")
            .get()
            .then((posts) => {
              posts.forEach((postDoc) => {
                let post = postDoc.data();
                post.userId = userId;
                post.userAvatar = userAvatar;
                post.username = username;
                admin
                  .firestore()
                  .collection("timeline")
                  .doc(context.params.userId)
                  .collection("timelinePosts")
                  .doc(postDoc.id)
                  .set(post);
              });
            });
        });
    } else {
      return admin
        .firestore()
        .collection("posts")
        .doc(change.before.id)
        .collection("userPosts")
        .get()
        .then((posts) => {
          posts.forEach((post) => {
            admin
              .firestore()
              .collection("timeline")
              .doc(context.params.userId)
              .collection("timelinePosts")
              .doc(post.id)
              .delete();
          });
        });
    }
  });
