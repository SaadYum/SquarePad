import React from "react";
import { Image, AsyncStorage, Vibration } from "react-native";
import { AppLoading, Notifications } from "expo";
import * as Permissions from "expo-permissions";

import { Asset } from "expo-asset";
import { Block, GalioProvider } from "galio-framework";

// import Screens from './navigation/Router';
import CheckScreens from "./navigation/CheckScreens";
import { Images, articles, argonTheme } from "./constants";
import { isUserSignedIn } from "./services/auth.service";
import { firebase } from "./services/firebase";

import Screens, { AppStack } from "./navigation/Router";
// import SyncScreen from './navigation/Router';
import { createAppContainer } from "react-navigation";
// Before rendering any navigation stack
import { enableScreens, useScreens } from "react-native-screens";
import { AnimatedRegion } from "react-native-maps";
import { firestore } from "firebase";
import Constants from "expo-constants";
enableScreens();

console.disableYellowBox = true;
console.ignoredYellowBox = ["Setting a timer"];

// cache app images
const assetImages = [
  Images.Onboarding,
  Images.LogoOnboarding,
  Images.Logo,
  Images.Pro,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo,
];

// cache product images
articles.map((article) => assetImages.push(article.image));

function cacheImages(images) {
  return images.map((image) => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    signedIn: false,
    interestsComplete: false,
    commentNotifications: {},
    planNotifications: {},
    userId: "",
    expoPushToken: "",
    notification: {},
  };

  // userId = firebase.auth().currentUser.uid;
  // userId = "";
  listenPlanNotifications = (userId) => {
    firebase
      .firestore()
      .collection("notifications")
      .doc(userId)
      .collection("userNotifications")
      .onSnapshot((snap) => {
        let planNotifications = [];
        let commentNotifications = [];

        // let updatedDocs = snap.docChanges().filter((change) => {
        //   return change.type === "modified";
        // });

        let newDocs = snap.docChanges().filter((change) => {
          return change.type === "added";
        });

        let planDocs = newDocs.filter((notification) => {
          return notification.doc.data().type == "plan";
        });

        let commentDocs = newDocs.filter((notification) => {
          return notification.doc.data().type == "comment";
        });

        planDocs.forEach((doc) => {
          planNotifications.push(doc.doc.data());
        });

        commentDocs.forEach((doc) => {
          commentNotifications.push(doc.doc.data());
        });

        let commentNotification = commentNotifications[0];
        let planNotification = planNotifications[0];

        console.log("Plan Notification", planNotification);
        console.log("Comment Notification", commentNotification);

        if (typeof planNotification !== "undefined") {
          this.sendPushNotification(
            "Recommended Plan",
            planNotification.content
          );
        }

        // if (typeof commentNotification !== "undefined") {
        //   this.sendPushNotification(
        //     commentNotification.user,
        //     commentNotification.content
        //   );
        // }
        // this.setState({
        //   planNotifications: planNotifications[0],
        //   commentNotifications: commentNotifications[0],
        // });
      });
  };

  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      const token = await Notifications.getExpoPushTokenAsync();
      console.log(token);
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .set(
          {
            push_token: token,
          },
          { merge: true }
        );

      this.setState({ expoPushToken: token });
    } else {
      alert("Must use physical device for Push Notifications");
    }
    if (Platform.OS === "android") {
      Notifications.createChannelAndroidAsync("default", {
        name: "default",
        sound: true,
        priority: "max",
        vibrate: [0, 250, 250, 250],
      });
    }
  };

  UNSAFE_componentWillMount = async () => {
    try {
      // this.registerForPushNotificationsAsync();
      // console.disableYellowBox= true;
      let userData = await AsyncStorage.getItem("userData");
      let data = JSON.parse(userData);
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.setState({ userId: user.uid });
          this.getLocationAsync();
          // console.log("MY user", this.state.userId);
          this.setState({ signedIn: true });
          firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .get()
            .then((doc) => {
              if (doc.data().interested) {
                this.setState({ interestsComplete: true });
              } else {
                this.setState({ interestsComplete: false });
              }
            });
          this.listenPlanNotifications(firebase.auth().currentUser.uid);
        } else {
          this.setState({ signedIn: false });
        }
      });

      // //  console.log(data);
      // if (data!=null){
      //   this.setState({signedIn: true})
      //   if(data.interested){
      //     this.setState({interestsComplete: true})
      //   }else{
      //     this.setState({interestsComplete: false})
      //   }
      // }else{
      //   this.setState({signedIn: false})
      // }
      // this.sendPushNotification();
      this.registerForPushNotificationsAsync();
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  ///GETTING TIME FROM TIMESTAMP

  pad = (num) => {
    return ("0" + num).slice(-2);
  };
  getTimeFromDate = (timestamp) => {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    // return this.pad(hours)+":"+this.pad(minutes)+":"+this.pad(seconds)
    return this.pad(hours) + ":" + this.pad(minutes);
  };

  //--------------------------------------------------//

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      alert("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({});
    let time = this.getTimeFromDate(location.timestamp);
    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .set(
        {
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            lastSeen: time,
          },
        },
        { merge: true }
      )
      .then(() => {
        console.log("updated location!");
      });
  };

  componentDidMount = () => {
    this.registerForPushNotificationsAsync();
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  };

  sendPushNotification = async (title, body) => {
    const message = {
      to: this.state.expoPushToken,
      sound: "default",
      title: title,
      body: body,
      data: { data: "goes here" },
      ios: { _displayInForeground: true },
      _displayInForeground: true,
    };
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  _handleNotification = (notification) => {
    if (notification.remote) {
      Vibration.vibrate();
      console.log(notification);
      const notificationId = Notifications.presentLocalNotificationAsync({
        title: notification.data.title,
        body: notification.data.body,
        ios: { _displayInForeground: true }, // <-- HERE'S WHERE THE MAGIC HAPPENS
      });
    } else {
      Vibration.vibrate();
      console.log(notification);
      this.setState({ notification: notification });
    }
  };
  render() {
    const Layout = AppStack(this.state.signedIn, this.state.interestsComplete);
    const Applayout = createAppContainer(Layout);
    if (!this.state.isLoadingComplete) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <GalioProvider theme={argonTheme}>
          <Block flex>
            <Applayout />
            {/* <SyncScreen/> */}
          </Block>
        </GalioProvider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([...cacheImages(assetImages)]);
  };

  _handleLoadingError = (error) => {
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}
