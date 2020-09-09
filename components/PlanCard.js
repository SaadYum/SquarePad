import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import StarRating from "react-native-star-rating";
import { key } from "../googleAPIKey";
import { Images } from "../constants";
import { withNavigation } from "react-navigation";
// import { Button, Block, theme } from "galio-framework";
import { Button, Block, Text, theme } from "galio-framework";
import * as firebase from "firebase";

const { height, width } = Dimensions.get("window");

class PlanCard extends Component {
  user = firebase.auth().currentUser;

  sendJoinRequest = () => {
    let plan = this.props.item;
    let user = this.props.user;
    let members = [];
    let sent = false;
    this.props.onJoinStart();
    firebase
      .firestore()
      .collection("plans")
      .doc(plan.creatorId)
      .collection("userPlans")
      .doc(plan.id)
      .get()
      .then((doc) => {
        members = doc.data().members;
        // console.log(members);
        let member = members.find((member) => member.userId === this.user.uid);
        if (typeof member != "undefined") {
          // if it already exists
          this.props.onJoinEnd("You already are a member!");
          sent = true;
          return;
        }
      })
      .then(() => {
        if (!sent) {
          firebase
            .firestore()
            .collection("plans")
            .doc(plan.creatorId)
            .collection("userPlans")
            .doc(plan.id)
            .collection("joinRequests")
            .doc(user.id)
            .set({
              avatar: user.avatar,
              name: user.name,
              userId: user.id,
            })
            .then(() => {
              this.props.onJoinEnd("Sent");
            })
            .catch((err) => alert(err));
        }
      })
      .catch((err) => alert(err));
  };

  removePlanFromGroup = () => {
    let plan = this.props.item;
    let user = this.props.user;
    let groupId = this.props.groupId;

    firebase
      .firestore()
      .collection("groups")
      .doc(groupId)
      .collection("discussion")
      .doc(plan.id)
      .delete()
      .then(() => alert("Plan Removed!"))
      .catch((err) => alert(err));
  };

  checkJoin = async () => {
    if (this.props.item.creatorId != this.user.uid) {
      const selection = await new Promise((resolve) => {
        const title = "Wanna Join";
        const message = "Send Join request";
        const buttons = [
          { text: "Send", onPress: () => resolve("Send") },
          { text: "Cancel", onPress: () => resolve(null) },
        ];
        Alert.alert(title, message, buttons);
      });
      if (selection == "Send") {
        this.sendJoinRequest();
      } else {
        return;
      }
    } else {
      // Creator
      const selection = await new Promise((resolve) => {
        const title = "Remove";
        const message = "Remove from Group";
        const buttons = [
          { text: "Remove", onPress: () => resolve("Remove") },
          { text: "Cancel", onPress: () => resolve(null) },
        ];
        Alert.alert(title, message, buttons);
      });
      if (selection == "Remove") {
        this.removePlanFromGroup();
      } else {
        return;
      }
    }
  };

  shareToGroup = async () => {
    const selection = await new Promise((resolve) => {
      const title = "Share!";
      const message = "";
      const buttons = [
        { text: "Share this Plan", onPress: () => resolve("Share") },
        { text: "Cancel", onPress: () => resolve(null) },
      ];
      Alert.alert(title, message, buttons);
    });

    if (selection == "Share") {
      this.props.onShareStart();
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.group.groupId)
        .collection("discussion")
        .doc(this.props.item.id)
        .set({
          plan: this.props.item,
          title: "plan",
        })
        .then(() => {
          this.props.onShareEnd();
        })
        .catch((err) => {
          alert(err);
        });
    } else {
      return;
    }
  };

  render() {
    const { item, navigation, group, share, join } = this.props;

    return (
      <Block style={{ borderRadius: 5 }}>
        <TouchableOpacity
          onPress={
            join
              ? () => {
                  this.checkJoin();
                }
              : !share
              ? () => {
                  // if (
                  //   item.status == "ongoing" ||
                  //   item.creatorId != this.user.uid
                  // ) {
                  //   navigation.navigate("StartTour", {
                  //     destination: item.location,
                  //     members: item.members,
                  //     destinationName: item.destination,
                  //     spots: item.spots,
                  //     planId: item.id,
                  //   });
                  // } else {
                  navigation.navigate("PlanDetails", { plan: item });
                  // }
                }
              : () => {
                  this.shareToGroup();
                }
          }
        >
          <View
            style={{
              width: this.props.width / 2 - 30,
              height: this.props.width / 2 - 20,
              margin: 10,
            }}
          >
            <View style={{ flex: 3 }}>
              <Image
                style={{
                  flex: 1,
                  width: null,
                  height: null,
                  resizeMode: "cover",
                  borderRadius: 10,
                }}
                source={
                  item.photos && {
                    uri:
                      item.photos.length > 0
                        ? item.photos[0]
                        : "http://www.clker.com/cliparts/P/b/P/L/T/i/map-location-md.png",
                  }
                }
              />
            </View>
            <View
              style={{
                backgroundColor: "#f0f0f0",
                borderBottomEndRadius: 10,
                borderBottomStartRadius: 10,
                flex: 1,
                alignItems: "flex-start",
                justifyContent: "space-evenly",
                paddingLeft: 10,
              }}
            >
              {/* <Text style={{ fontSize: 10, color: '#b63838' }}>{item.vicinity}</Text> */}
              <Text h4 style={{ marginTop: 7 }}>
                {item.destination}
              </Text>
              <Block
                center
                flex={1}
                row
                style={{
                  padding: 5,
                  borderRadius: 15,
                  marginBottom: 5,
                  marginTop: 5,
                  width: width * 0.8,
                }}
              >
                <Block left flex={1}>
                  <Text h7>From</Text>
                  <Text h7>{item.startDate}</Text>
                </Block>
                <Block center flex={1}>
                  <Text h7> </Text>
                  <Text h7> --- </Text>
                </Block>
                <Block right flex={1}>
                  <Text h7>To</Text>
                  <Text h7>{item.endDate}</Text>
                </Block>
              </Block>
              {/* <Text style={{ fontSize: 10 }}>{this.props.price}$</Text> */}
              {/* <StarRating
                        disable={true}
                        maxStars={5}
                        rating={item.rating}
                        starSize={10}

                    /> */}
              <Block flex={1}></Block>
            </View>
          </View>
        </TouchableOpacity>
      </Block>
    );
  }
}
export default withNavigation(PlanCard);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
