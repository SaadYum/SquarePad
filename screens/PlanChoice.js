import React, { Component } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import StarRating from "react-native-star-rating";
import { Images, argonTheme } from "../constants";
import DatePicker from "react-native-datepicker";

import { SliderBox } from "react-native-image-slider-box";
import MapView, { Marker, Callout } from "react-native-maps";
import { key } from "../googleAPIKey";

import { Button, Block, Text, theme } from "galio-framework";

import { Icon, Input } from "../components";
const { width } = Dimensions.get("screen");

class PlanChoice extends Component {
  state = {
    destination: "",
    startDate: "",
    endDate: "",
    name: this.props.navigation.getParam("name"),
    currentDate: "",
    maxDate: "",
  };

  getCurrentDate = () => {
    var myDate = new Date();
    var date = myDate.getDate(); //Current Date
    var month = myDate.getMonth() + 1; //Current Month
    var year = myDate.getFullYear(); //Current Year
    this.setState({ currentDate: year + "-" + month + "-" + date }, () => {
      myDate.setDate(date + 7);
      date = myDate.getDate(); //Current Date
      month = myDate.getMonth() + 1; //Current Month
      year = myDate.getFullYear(); //Current Year

      this.setState({ maxDate: year + "-" + month + "-" + date });
    });
  };

  UNSAFE_componentWillMount = () => {
    this.getCurrentDate();
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        <Block flex={1}></Block>

        <Block flex={5} style={styles.container}>
          <Block
            shadow
            flex
            style={{
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              marginBottom: 2,
              width: width * 0.9,
            }}
          >
            <Block row left flex={1} style={{ paddingTop: 10, paddingLeft: 5 }}>
              <Text h4>{this.state.name}</Text>
            </Block>
            <Block center flex={2}>
              <Block center width={width * 0.8} style={{ marginBottom: 5 }}>
                <DatePicker
                  style={{ width: 200 }}
                  date={this.state.startDate}
                  mode="date"
                  placeholder="Start Date"
                  format="YYYY-MM-DD"
                  minDate={this.state.currentDate}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: "absolute",
                      left: 0,
                      top: 4,
                      marginLeft: 0,
                    },
                    dateInput: {
                      marginLeft: 36,
                      borderRadius: 4,
                      borderWidth: 0.2,
                      borderColor: "#737373",
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  onDateChange={(date) => {
                    this.setState({ startDate: date });
                  }}
                />
              </Block>
              <Block center width={width * 0.8} style={{ marginBottom: 15 }}>
                <DatePicker
                  style={{ width: 200 }}
                  date={this.state.endDate}
                  mode="date"
                  placeholder="End Date"
                  format="YYYY-MM-DD"
                  minDate={this.state.currentDate}
                  maxDate={this.state.maxDate}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: "absolute",
                      left: 0,
                      top: 4,
                      marginLeft: 0,
                    },
                    dateInput: {
                      marginLeft: 36,
                      borderRadius: 4,
                      borderWidth: 0.2,
                      borderColor: "#737373",
                    },
                    // ... You can check the source to find the other keys.
                  }}
                  onDateChange={(date) => {
                    this.setState({ endDate: date });
                  }}
                />
              </Block>
            </Block>
            <Block center flex={1} style={{ marginTop: 2, paddingTop: 5 }}>
              <Button
                round
                size="small"
                color="#ff6347"
                shadowless
                onPress={() => {
                  if (this.state.startDate != "" && this.state.endDate != "") {
                    this.props.navigation.navigate("SelectMembers", {
                      place_id: this.props.navigation.getParam("place_id"),
                      types: this.props.navigation.getParam("types"),
                      name: this.props.navigation.getParam("name"),
                      images: this.props.navigation.getParam("images"),
                      location: this.props.navigation.getParam("location"),
                      startDate: this.state.startDate,
                      endDate: this.state.endDate,
                      dateCreated: this.state.currentDate,
                    });
                  } else {
                    alert("Select Dates First!");
                  }
                }}
              >
                Recommended Plan
              </Button>
            </Block>
            <Block center flex={1} style={{ marginTop: 2, paddingTop: 5 }}>
              <Button
                round
                size="small"
                color="#ff6347"
                shadowless
                onPress={() => {
                  if (this.state.startDate != "" && this.state.endDate != "") {
                    this.props.navigation.navigate("CreatePlan", {
                      place_id: this.props.navigation.getParam("place_id"),
                      types: this.props.navigation.getParam("types"),
                      name: this.props.navigation.getParam("name"),
                      images: this.props.navigation.getParam("images"),
                      location: this.props.navigation.getParam("location"),
                      startDate: this.state.startDate,
                      endDate: this.state.endDate,
                      dateCreated: this.state.currentDate,
                    });
                  } else {
                    alert("Select Dates First!");
                  }
                }}
              >
                Create Plan
              </Button>
            </Block>
          </Block>
          <Block flex={0.2}></Block>
        </Block>
      </Block>
    );
  }
}
export default PlanChoice;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    justifyContent: "center",
  },
  home: {
    width: width,
  },
  articles: {
    width: width,
    paddingVertical: theme.SIZES.BASE,
  },
  mapStyle: {
    borderRadius: 4,
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height / 3.5,
  },
});
