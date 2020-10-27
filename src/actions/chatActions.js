import {
  TEST_ACTION,
  FETCH_CHATS,
  FETCH_FOLLOWING,
  FETCH_FOLLOWERS,
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
              type: FETCH_FOLLOWERS,
              followers: finalUsers,
            });
          });
        });
    });
  };
};
