import { testAction } from "../actions/chatActions";
import { TEST_ACTION, FETCH_CHATS } from "../actions/types";
import * as firebase from "firebase";
const initialState = {
  chats: [{ data: "one" }, { data: "one" }, { data: "one" }],
  testData: "Something",
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CHATS:
      // let users = getChats();
      
      // console.log(users)
      return state;
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
