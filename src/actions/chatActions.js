import {TEST_ACTION, FETCH_CHATS} from './types';
import * as firebase from "firebase";

export const testAction = (data)=>{
  return (dispatch, getState) =>{
dispatch(

  {
    type: TEST_ACTION,
    data: data
  }
  )
  }
}

export const fetchChats = ()=>{



  return (dispatch, getState) =>{
    
    dispatch(
        async()=>{

          let chats = await getChats();
          console.log("Chats: ", chats);
        }
    )
dispatch(

  {
    type: FETCH_CHATS,
  
  }
  )
  }
}
// export const fetchChats = ()=>{



//   return (dispatch, getState) =>{
    
//     dispatch(
//         async()=>{

//           let chats = await getChats();
//           console.log("Chats: ", chats);
//         }
//     )
// dispatch(

//   {
//     type: FETCH_CHATS,
  
//   }
//   )
//   }
// }



 const getChats = async()=>{
    let users = [];
    
   await firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid)
    .collection("following").get().then((followingUsers)=>{
followingUsers.forEach(user => {
    users.push(user.id);
})
}).then(()=>{

  // console.log("one by one: ", users)
  // return getFollowedUsersData(users);
  let user =  getFollowedUsersData(users);
  user.then((res)=>console.log(res))
  
})

    
}

    
  // Get all the users data the current user is following
  const getFollowedUsersData = async (fusers) => {
    let followedUsers = fusers;
    let users = [];
    let followedUsersLength = fusers.length;
    let i=0;

    let promises = []

    await Promise.all(
    followedUsers.map(async (userId) => {
      
       await firebase.firestore().collection("users")
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
                    
          }).then(()=>{
            Promise.resolve();

          })
        })
    ).then(()=>{

          
          
          console.log("Following length value: "+ followedUsersLength)
          // console.log("done ", users)
          
          return users;    
        })
            
            
            
            //   this.setState({ users: users })
      };
