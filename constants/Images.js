import * as firebase from "firebase";
import { AsyncStorage } from "react-native";
// const user = firebase.auth().currentUser;
// ;

const cloudImages = [];

// Getting All the CurrentUser posts from storage
export const getPosts = async () => {
  await firebase
    .firestore()
    .collection("posts")
    .doc(firebase.auth().currentUser.uid)
    .collection("userPosts")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        cloudImages.push(doc.data());
      });
    });
  return cloudImages;
};
// local imgs
const Onboarding = require("../assets/imgs/bg.jpg");
const Logo = require("../assets/imgs/travyRed.png");
const LogoOnboarding = require("../assets/imgs/TravyLogo.png");
const ProfileBackground = require("../assets/imgs/profile-screen-bg1.jpg");
const RegisterBackground = require("../assets/imgs/register-bg.png");
const Pro = require("../assets/imgs/getPro-bg.png");
const ArgonLogo = require("../assets/imgs/argonlogo.png");
const iOSLogo = require("../assets/imgs/ios.png");
const androidLogo = require("../assets/imgs/android.png");
const groupsMain = require("../assets/imgs/groups.jpg");
const groupFiller = require("../assets/imgs/groupFiller.jpg");

// internet imgs

const ProfilePicture =
  "https://firebasestorage.googleapis.com/v0/b/travycomsats.appspot.com/o/profilePics%2FprofilePic2.PNG?alt=media&token=72bc785f-8b04-40d4-9270-141ff2254892";
const galleryIcon =
  "https://cdn0.iconfinder.com/data/icons/communication-bold-part-2/100/bold-67-512.png";
const placesBaseImage =
  "https://www.yourdictionary.com/images/definitions/lg/9868.navigate.jpg";
const Viewed = [
  "https://images.unsplash.com/photo-1501601983405-7c7cabaa1581?fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1543747579-795b9c2c3ada?fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1551798507-629020c81463?fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1503642551022-c011aafb3c88?fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1482686115713-0fbcaced6e28?fit=crop&w=240&q=80",
];

const Products = {
  "View article":
    "https://images.unsplash.com/photo-1501601983405-7c7cabaa1581?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=840&q=840",
};

export default {
  galleryIcon,
  Onboarding,
  Logo,
  LogoOnboarding,
  ProfileBackground,
  ProfilePicture,
  RegisterBackground,
  Viewed,
  Products,
  Pro,
  ArgonLogo,
  iOSLogo,
  androidLogo,
  placesBaseImage,
  groupsMain,
  groupFiller,
};
