import * as GoogleSignIn from "expo-google-sign-in";

const isUserEqual = (googleUser, firebaseUser) => {
  if (firebaseUser) {
    var providerData = firebaseUser.providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (
        providerData[i].providerId ===
          firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
        providerData[i].uid === googleUser.getBasicProfile().getId()
      ) {
        // We don't need to reauth the Firebase connection.
        return true;
      }
    }
  }
  return false;
};

const initAsync = async () => {
  await GoogleSignIn.initAsync({
    // You may ommit the clientId when the firebase `googleServicesFile` is configured
    clientId:
      "3416567928-3tnaupt990vs9t6dv33cfg7cif8jtkrq.apps.googleusercontent.com",
  });
  _syncUserWithStateAsync();
};

const _syncUserWithStateAsync = async () => {
  const user = await GoogleSignIn.signInSilentlyAsync();
  console.log(user);
};

const signOutAsync = async () => {
  await GoogleSignIn.signOutAsync();
  // this.setState({ user: null });
};

const signInAsync = async () => {
  try {
    await GoogleSignIn.askForPlayServicesAsync();
    const { type, user } = await GoogleSignIn.signInAsync();
    if (type === "success") {
      _syncUserWithStateAsync();
    }
  } catch ({ message }) {
    alert("login: Error:" + message);
  }
};

const onSignIn = (googleUser) => {
  console.log("Google Auth Response", googleUser);
  // We need to register an Observer on Firebase Auth to make sure auth is initialized.
  var unsubscribe = firebase.auth().onAuthStateChanged(
    function (firebaseUser) {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
        );
        // Sign in with credential from the Google user.
        firebase
          .auth()
          .signInWithCredential(credential)
          .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          });
      } else {
        console.log("User already signed-in Firebase.");
      }
    }.bind(this)
  );
};

export const signInWithGoogleAsync = async () => {
  try {
    console.log("GGOGOGL");
    const result = await GoogleSignIn.initAsync({
      behavior: "web",
      // androidClientId: YOUR_CLIENT_ID_HERE,
      clientId:
        "498031225132-tr3nisp1o1es9uucee6227ietihvvk1c.apps.googleusercontent.com",

      scopes: ["profile", "email"],
    });

    if (result.type === "success") {
      // onSignIn(result);
      console.log(result);
      return result.accessToken;
    } else {
      console.log("not working");
      return { cancelled: true };
    }
  } catch (e) {
    console.log(e);
    return { error: true };
  }
};
