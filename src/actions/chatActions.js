import {
  TEST_ACTION,
  FETCH_CHATS,
  FETCH_FOLLOWING,
  FETCH_FOLLOWERS,
  FETCH_NOTIFICATIONS,
  RESET_NOTIFICATIONS,
} from "./types";
import * as firebase from "firebase";

export const testAction = (data) => {
  return (dispatch, getState) => {
    dispatch({
      type: TEST_ACTION,
      data: data,
    });
  };
};

export const fetchChats = () => {
  return (dispatch, getState) => {
    dispatch(async () => {
      let users = [];
      let finalUsers = [];

      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("following")
        .get()
        .then((followingUsers) => {
          followingUsers.forEach((user) => {
            users.push(user.id);
          });
        })
        .then(async () => {
          await Promise.all(
            users.map(async (userId) => {
              await firebase
                .firestore()
                .collection("users")
                .doc(userId)
                .get()
                .then((doc) => {
                  let name = doc.data().username;

                  let avatar = doc.data().profilePic;
                  let push_token = doc.data().push_token;

                  let userObj = {
                    username: name,
                    userId: userId,
                    avatar: avatar,
                    push_token:
                      typeof push_token !== "undefined" ? push_token : "",
                  };
                  finalUsers.push(userObj);
                })
                .then(() => {
                  Promise.resolve();
                });
            })
          ).then(() => {
            dispatch({
              type: FETCH_CHATS,
              followedUsers: finalUsers,
            });
          });
        });
    });
  };
};

export const fetchFollowing = () => {
  return (dispatch, getState) => {
    dispatch(async () => {
      let users = [];
      let finalUsers = [];

      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("following")
        .get()
        .then((followingUsers) => {
          followingUsers.forEach((user) => {
            users.push(user.id);
          });
        })
        .then(async () => {
          await Promise.all(
            users.map(async (userId) => {
              await firebase
                .firestore()
                .collection("users")
                .doc(userId)
                .get()
                .then((doc) => {
                  let username = doc.data().username;
                  let name = doc.data().name;

                  let avatar = doc.data().profilePic;
                  let push_token = doc.data().push_token;

                  let userObj = {
                    username: username,
                    name: name,
                    userId: userId,
                    avatar: avatar,
                    push_token:
                      typeof push_token !== "undefined" ? push_token : "",
                  };
                  finalUsers.push(userObj);
                })
                .then(() => {
                  Promise.resolve();
                });
            })
          ).then(() => {
            dispatch({
              type: FETCH_FOLLOWING,
              followedUsers: finalUsers,
            });
          });
        });
    });
  };
};

export const fetchFollowers = () => {
  return (dispatch, getState) => {
    dispatch(async () => {
      let users = [];
      let finalUsers = [];

      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("followedBy")
        .get()
        .then((followingUsers) => {
          followingUsers.forEach((user) => {
            users.push(user.id);
          });
        })
        .then(async () => {
          await Promise.all(
            users.map(async (userId) => {
              await firebase
                .firestore()
                .collection("users")
                .doc(userId)
                .get()
                .then((doc) => {
                  let username = doc.data().username;
                  let name = doc.data().name;

                  let avatar = doc.data().profilePic;
                  let push_token = doc.data().push_token;

                  let userObj = {
                    username: username,
                    name: name,
                    userId: userId,
                    avatar: avatar,
                    push_token:
                      typeof push_token !== "undefined" ? push_token : "",
                  };
                  finalUsers.push(userObj);
                })
                .then(() => {
                  Promise.resolve();
                });
            })
          ).then(() => {
            dispatch({
              type: FETCH_FOLLOWERS,
              followers: finalUsers,
            });
          });
        });
    });
  };
};

export const fetchNotifications = (data) => {
  return (dispatch, getState) => {
    console.log("FETEEEE");
    let chatCounter = 0;
    let notificationsArray = [];
    resetNotifications();

    firebase
      .firestore()
      .collection("notifications")
      .doc(firebase.auth().currentUser.uid)
      .collection("userNotifications")
      .orderBy("time", "desc")
      .onSnapshot(async (snapshot) => {
        notificationsArray = [];
        chatCounter = 0;
        await Promise.all(
          snapshot.forEach((doc) => {
            console.log("HIT");
            firebase
              .firestore()
              .collection("users")
              .doc(doc.data().userId)
              .get()
              .then((doco) => {
                let pp = {
                  avatar: doco.data().profilePic,
                  content: doc.data().content,
                  source: doc.data().source,
                  time: doc.data().time,
                  type: doc.data().type,
                  userId: doc.data().userId,
                  username: doco.data().username,
                };
                notificationsArray.push(pp);
                if (doc.data().type == "chat") {
                  chatCounter = chatCounter + 1;
                }

                notificationsArray = notificationsArray.sort((a, b) =>
                  a.time < b.time ? 1 : -1
                );
                dispatch({
                  type: FETCH_NOTIFICATIONS,
                  notifications: notificationsArray,
                  unseenChats: chatCounter,
                });
              });
          })
        );
      });
  };
};

export const resetNotifications = () => {
  return (dispatch, getState) => {
    dispatch({
      type: RESET_NOTIFICATIONS,
    });
  };
};
