import React, { Component } from "react";
import { View, StyleSheet, Image, Dimensions, ScrollView } from "react-native";
import StarRating from "react-native-star-rating";

import { SliderBox } from "react-native-image-slider-box";
import MapView, { Marker, Callout } from "react-native-maps";
import { key } from "../googleAPIKey";
import DatePicker from "react-native-datepicker";

import { Button, Block, Text, theme } from "galio-framework";

import { Icon, Input } from "../components";
const { width } = Dimensions.get("screen");

class EditSpot extends Component {
  //   getPlaceDetails = () => {
  //     const place_id = this.props.navigation.getParam("spot_id");
  //     let url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,geometry,photos,rating,formatted_phone_number&key=${key}`;
  //     // console.log(url);
  //     fetch(url)
  //       .then((res) => res.json())
  //       .then((result) => {
  //         let res = result.result;
  //         let photos = [];
  //         res.photos.forEach((photo) => {
  //           let url = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&sensor=false&maxheight=${photo.height}&maxwidth=${photo.width}&key=${key}`;
  //           photos.push(url);
  //         });
  //         let location = {
  //           latitude: res.geometry.location.lat,
  //           longitude: res.geometry.location.lng,
  //           latitudeDelta: 0.0922,
  //           longitudeDelta: 0.0421,
  //         };
  //         this.setState({
  //           images: photos,
  //           name: res.name,
  //           location: location,
  //           rating: res.rating,
  //         });

  //         // console.log(this.state);
  //       });
  //   };

  state = {
    place_id: this.props.navigation.getParam("spot_id"),
    destination_id: this.props.navigation.getParam("destination_id"),
    startDate: this.props.navigation.getParam("startDate"),
    endDate: this.props.navigation.getParam("endDate"),
    spotStartDateTime: this.props.navigation.getParam("spotStartDateTime"),
    spotEndDateTime: this.props.navigation.getParam("spotEndDateTime"),
    images: this.props.navigation.getParam("photos"),
    name: this.props.navigation.getParam("name"),
    added: this.props.navigation.getParam("added"),
    location: this.props.navigation.getParam("location"),
    rating: 4,

    mapRegion: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
  };

  addSpot = () => {
    const { params } = this.props.navigation.state;

    params.addSpot(
      this.state.place_id,
      this.state.name,
      this.state.location,
      this.state.spotStartDateTime,
      this.state.spotEndDateTime,
      this.state.images
    );
    this.setState({ added: true });
    this.props.navigation.goBack();
  };

  removeSpot = () => {
    const { params } = this.props.navigation.state;

    params.removeSpot(this.state.place_id);
    this.setState({ added: false });
    // this.props.navigation.goBack();
  };

  renderImages = () => {
    return (
      <Block flex style={styles.container}>
        <Block shadow flex={2} center style={{ width: width * 0.9 }}>
          <SliderBox
            images={this.state.images}
            sliderBoxHeight={200}
            onCurrentImagePressed={(index) =>
              console.warn(`image ${index} pressed`)
            }
            // autoplay
            // circleLoop
          />
        </Block>
        <Block
          shadow
          flex={4}
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            marginBottom: 2,
            width: width * 0.9,
          }}
        >
          <Block left flex={1} style={{ paddingTop: 10, paddingLeft: 5 }}>
            <Text h5>{this.state.name}</Text>
            <StarRating
              disable={true}
              maxStars={5}
              rating={this.state.rating}
              starSize={20}
              fullStarColor={"tomato"}
            />
          </Block>

          <Block
            center
            flex={0.8}
            width={width * 0.8}
            style={{ marginBottom: 15 }}
          >
            <DatePicker
              style={{ width: 200 }}
              date={this.state.spotStartDateTime}
              mode="datetime"
              placeholder="Start Date/Time"
              // format="YYYY-MM-DD"
              minDate={this.state.startDate}
              maxDate={this.state.endDate}
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
                this.setState({ spotStartDateTime: date });
              }}
            />
          </Block>
          {this.state.spotStartDateTime != "" && (
            <Block
              center
              flex={0.8}
              width={width * 0.8}
              style={{ marginBottom: 15 }}
            >
              <DatePicker
                style={{ width: 200 }}
                date={this.state.spotEndDateTime}
                mode="datetime"
                placeholder="End Date/Time"
                // format="YYYY-MM-DD"
                minDate={this.state.spotStartDateTime}
                maxDate={this.state.endDate}
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
                  this.setState({ spotEndDateTime: date });
                }}
              />
            </Block>
          )}

          <Block center flex={1} style={{ marginTop: 2, paddingTop: 5 }}>
            {!this.state.added && (
              <Button
                round
                size="small"
                color="#ff6347"
                shadowless
                onPress={this.addSpot}
              >
                Add to Plan
              </Button>
            )}
            {this.state.added && (
              <Button
                round
                size="small"
                color="#ff6347"
                shadowless
                onPress={this.removeSpot}
              >
                Remove
              </Button>
            )}
          </Block>
        </Block>
        <Block shadow center flex={3} style={{ marginTop: 4 }}>
          <MapView
            showsUserLocation
            provider={"google"}
            style={styles.mapStyle}
            region={this.state.location}
            showsUserLocation
            showsMyLocationButton
            showsPointsOfInterest
            // onRegionChange={this.onRegionChange}
            // onUserLocationChange={this.handleChangeLocation}
          >
            <Marker
              coordinate={{
                latitude: this.state.location.latitude,
                longitude: this.state.location.longitude,
              }}
              title={this.state.name}
            >
              {/* <Callout >
                            <View >
                            <Text>{this.state.name}</Text>
                            </View>
                        </Callout> */}
            </Marker>
            {/* {this.state.followingUserMarkers} */}
          </MapView>
        </Block>
        <Block flex={0.8} />
      </Block>
    );
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderImages()}
      </Block>
    );
  }
}
export default EditSpot;

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
