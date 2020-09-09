import React, { Component } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "../components/Icon";
import Category from "../components/Category";
import PlanCard from "../components/PlanCard";

import * as firebase from "firebase";

import { key } from "../googleAPIKey";

import * as Permissions from "expo-permissions";
import * as Location from "expo-location";

import { Images } from "../constants";
import { FlatList } from "react-native-gesture-handler";
import { Block, Text } from "galio-framework";
import Spinner from "react-native-loading-spinner-overlay";

const { height, width } = Dimensions.get("window");
class SharePlan extends Component {
  user = firebase.auth().currentUser;

  state = {
    group: this.props.navigation.getParam("group"),
    plans: [],
    refreshing: false,
    gotPlans: false,
    spinner: false,
  };

  UNSAFE_componentWillMount() {
    this.getPlans();
  }

  asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };
  getInvitedPlans = () => {
    this.setState({ refreshing: true });

    let plansRef = firebase
      .firestore()
      .collection("plans")
      .doc(this.user.uid)
      .collection("invitedPlans");

    plansRef.get().then((querySnapshot) => {
      let plans = this.state.plans;
      querySnapshot.forEach(async (doc) => {
        let plan = doc.data();

        let res = await firebase
          .firestore()
          .collection("plans")
          .doc(plan.creatorId)
          .collection("userPlans")
          .doc(plan.planId)
          .get()
          .then((doc) => {
            let planObj = doc.data();
            planObj.id = doc.id;
            plans.push(planObj);

            this.setState({ plans: plans }, () => {
              console.log("Plans", this.state.plans);
              this.setState({ refreshing: false, gotPlans: true });
            });

            //   console.log(plans);
          });
      });
      this.setState({ refreshing: false, gotPlans: true });
    });
  };

  getPlans = () => {
    this.setState({ refreshing: true });
    let plansRef = firebase
      .firestore()
      .collection("plans")
      .doc(this.user.uid)
      .collection("userPlans");

    plansRef
      .where("status", "in", ["ready", "ongoing"])
      .get()
      .then((querySnapshot) => {
        let plans = this.state.plans;
        querySnapshot.forEach((doc) => {
          let plan = doc.data();
          plan.id = doc.id;
          plans.push(plan);
          //   console.log(plans);
        });

        this.setState({ plans: plans }, () => {
          // this.setState({ refreshing: false });
        });
      })
      .then(() => {
        this.getInvitedPlans();
      });
  };

  onRefresh = () => {
    this.setState({ refreshing: true });

    this.getPlans().then(() => {
      this.setState({ refreshing: false });
    });
  };

  getMorePlaces = () => {};

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: 35 }}>
            <Spinner
              visible={this.state.spinner}
              textContent={"Sharing.."}
              textStyle={{ color: "#FFF" }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                paddingHorizontal: 20,
                alignSelf: "center",
              }}
            >
              My Plans
            </Text>
            {this.state.plans.length == 0 && this.state.refreshing && (
              <Block center style={{ paddingTop: 20 }}>
                <ActivityIndicator size="large" />
              </Block>
            )}

            {this.state.plans.length == 0 && !this.state.refreshing && (
              <Block center style={{ marginTop: 50 }}>
                <Text h5>No Plans Yet!</Text>
              </Block>
            )}
            <FlatList
              style={{
                paddingHorizontal: 20,
                marginTop: 20,
                flexDirection: "row",
                flexWrap: "wrap",
              }}
              contentContainerStyle="space-between"
              showsVerticalScrollIndicator={false}
              onScrollEndDrag={this.getMorePlaces}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.getPlans}
                />
              }
              data={this.state.plans}
              renderItem={({ item }) => (
                <PlanCard
                  width={width * 1.85}
                  item={item}
                  onShareStart={() => this.setState({ spinner: true })}
                  onShareEnd={() => {
                    this.setState({ spinner: false });
                    this.props.navigation.goBack();
                  }}
                  share
                  group={this.state.group}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
export default SharePlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
