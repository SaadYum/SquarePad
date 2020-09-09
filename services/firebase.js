import * as firebase from "firebase/app";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBGLaPXq7JjITJZG-osUkeSK1pnp3fXG-c",
  authDomain: "square-pad-3a630.firebaseapp.com",
  databaseURL: "https://square-pad-3a630.firebaseio.com",
  projectId: "square-pad-3a630",
  storageBucket: "square-pad-3a630.appspot.com",
  messagingSenderId: "498031225132",
  appId: "1:498031225132:web:04f8dc7c835bec96dd2489",
  measurementId: "G-PLVY9WE9JQ",
};
// const firebaseConfig = {
//     apiKey: "AIzaSyACf130jnv_mYX-eS8ZaEKpKSYe0tAg0tA",
//     authDomain: "travycomsats.firebaseapp.com",
//     databaseURL: "https://travycomsats.firebaseio.com",
//     projectId: "travycomsats",
//     storageBucket: "travycomsats.appspot.com",
//     messagingSenderId: "3416567928",
//     appId: "1:3416567928:web:abf19a8fbdd6a20fc03d8d"
// };

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();

export { firebase, firestore };
