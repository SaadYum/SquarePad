import { firebase } from "./firebase";
import { AsyncStorage } from "react-native";


const db = firebase.firestore();
const auth = firebase.auth();



const getToken = async(user)=> {
   try {
      let userData = await AsyncStorage.getItem("userData");
      let data = JSON.parse(userData);
      return data;
    } catch (error) {
      console.log("Something went wrong", error);
    }
  }



//For removing user data from AsynchStorage
const deleteToken= async (userId)=> {
  try {
     await AsyncStorage.removeItem("userData");
     await AsyncStorage.removeItem("userProfilePic("+userId+")");
    alert("Signed Out!");
  } catch (error) {
    console.log("Something went wrong", error);
  }
};



//FireBase functions
export const CreateUser = (username, name, email, password, bio) => {
  return auth.createUserWithEmailAndPassword(email, password).then(cred=>{
       db.collection("users").doc(cred.user.uid).set({
        username: username,
        name: name,
        email: email,
        password: password,
        bio: bio
      })
  })
};

export const SigninUser = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};


export const logOut = ()=>{
  let userId = auth.currentUser.uid;
    auth.signOut().then(()=>{
        getToken();
        // console.log(getToken());
        deleteToken(userId);
        getToken();
    })
}


export const isUserSignedIn = () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      return true;
    } else {
      return false;
    }
  });
};
