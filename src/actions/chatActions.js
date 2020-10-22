import {TEST_ACTION, FETCH_CHATS} from './types';

export const testAction = (data)=>(
    {
        type: TEST_ACTION,
        data: data
    }
)

export const fetchChats = ()=>(
    {
        type: FETCH_CHATS,
        data: getChats()
    }
)



 const getChats = ()=>{
    let users = [];
    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid)
    .collection("following").get().then((followingUsers)=>{
followingUsers.forEach(user => {
    users.push(user.id);
});
    });

return getFollowedUsersData(users);
    
}

    
  // Get all the users data the current user is following
  const getFollowedUsersData = async (fusers) => {
    let followedUsers = fusers;
    let users = [];
    followedUsers.forEach(async (userId) => {
         firebase.firestore().collection("users")
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
              push_token: typeof push_token !== "undefined" ? push_token : "",
            };
            users.push(userObj);
          });
      });
    //   this.setState({ users: users })
return users;    
  };
