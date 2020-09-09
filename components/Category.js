import React, { Component, PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

class Category extends PureComponent {
  render() {
    // console.log(this.props.imageUri);

    return (
      <View
        style={{
          height: 130,
          width: 130,
          marginLeft: 20,
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: "#ddd",
          borderRadius: 5,
        }}
      >
        <View style={{ flex: 2 }}>
          <Image
            source={{ uri: this.props.imageUri }}
            style={{
              flex: 1,
              width: null,
              height: 30,
              borderRadius: 10,
              resizeMode: "repeat",
            }}
          />
        </View>
        <View style={{ flex: 1, paddingLeft: 10, paddingTop: 10 }}>
          <Text>{this.props.name}</Text>
        </View>
      </View>
    );
  }
}
export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
