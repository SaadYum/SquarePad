import React from "react";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import PropTypes from "prop-types";
import { Button, Block, Text } from "galio-framework";
import * as firebase from "firebase";

import argonTheme from "../constants/Theme";
import { Images } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";

class LocationItem extends React.Component {
  state = {
    avatar: Images.ProfilePicture,
    username: "",
    comment: "",
    commentDeleted: false,
    // isLoading : false,
  };

  handleDetailResults = async () => {
    const {
      fetchDetails,
      place_id,
      updateLocation,
      structured_formatting,
      clearSearch,
    } = this.props;
    const res = await fetchDetails(place_id);
    // console.log(res.geometry.location);
    let locationName = structured_formatting.main_text;
    let coordinates = res.geometry.location;
    let photos = [res.photos[0]];
    let place = {
      id: res.id,
      marker: {
        latitude: res.geometry.location.lat,
        longitude: res.geometry.location.lng,
      },
      photos: photos,
      place_id: res.place_id,
      rating: 4,
      types: res.types,
      vicinity: res.vicinity,
    };
    const locObject = { locationName, coordinates, place };
    clearSearch();
    updateLocation(locObject);
  };

  render() {
    return (
      <TouchableOpacity
        style={styles.searchItem}
        onPress={this.handleDetailResults}
      >
        <Text style={{ paddingLeft: 10 }}>
          {this.props.structured_formatting.main_text}
        </Text>
        {/* <Text>{el.}</Text> */}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  smallButton: {
    width: 150,
    height: 30,
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  comment: {
    flex: 1,
    paddingTop: 8,
    paddingLeft: 10,
    marginLeft: 5,
    height: 28,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fcfcfc",
    borderColor: "#fcfcfc",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0,
  },
  cardUsername: {
    paddingTop: 4,
  },
  searchItem: {
    height: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  cardUser: {
    fontFamily: "Arial",
    fontWeight: "400",
    paddingTop: 8,
    paddingLeft: 4,
    color: argonTheme.COLORS.BLACK,
  },
});

export default LocationItem;
