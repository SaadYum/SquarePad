import { testAction } from "../actions/chatActions";
import {
  TEST_ACTION,
  FETCH_CHATS,
  FETCH_FOLLOWING,
  FETCH_FOLLOWERS,
} from "../actions/types";
import * as firebase from "firebase";
const initialState = {
  chats: [{ data: "one" }, { data: "one" }, { data: "one" }],
  testData: "Something",
  users: [],
  followedUsers: [],
  followers: [],
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CHATS:
      let followedUsers = action.followedUsers;
      return {
        ...state,
        users: followedUsers,
      };

    case FETCH_FOLLOWING:
      let following = action.followedUsers;
      return {
        ...state,
        followedUsers: following,
      };

    case FETCH_FOLLOWERS:
      let myFollowers = action.followers;
      return {
        ...state,
        followers: myFollowers,
      };

    case TEST_ACTION:
      return {
        ...state,

        chats: state.chats.concat({
          key: Math.random(),
          data: action.data,
        }),
      };

    default:
      return state;
  }
};

export default chatReducer;
