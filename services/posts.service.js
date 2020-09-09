import { firebase } from "./firebase";


var storage = firebase.storage();
var storageRef = storage.ref();

var imagesRef = storageRef.child('postImages');
var videosRef = storageRef.child('postVideos');
var profilePicRef = storageRef.child('profilePics');
