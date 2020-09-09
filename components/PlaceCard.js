import React, { Component } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import StarRating from "react-native-star-rating";
import { key } from "../googleAPIKey";
import { Images } from "../constants";
import { withNavigation } from "react-navigation";
import { Button, Block, theme } from "galio-framework";

class PlaceCard extends Component {
  render() {
    const { item, navigation } = this.props;
    // console.log(item);
    return (
      <Block style={{ borderRadius: 5 }}>
        <TouchableOpacity
          onPress={() => {
            // console.log(post.image);
            navigation.navigate("PlaceDetail", {
              place_id: item.place_id,
              item: item,
            });
          }}
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
                        ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${item.photos[0].photo_reference}&sensor=false&maxheight=${item.photos[0].height}&maxwidth=${item.photos[0].width}&key=${key}`
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
              <Text style={{ fontSize: 10, color: "#b63838" }}>
                {item.vicinity}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                {item.name ? item.name : item.vicinity}
              </Text>
              {/* <Text style={{ fontSize: 10 }}>{this.props.price}$</Text> */}
              <StarRating
                disable={true}
                maxStars={5}
                rating={item.rating}
                starSize={10}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Block>
    );
  }
}
export default withNavigation(PlaceCard);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
