import { Block } from "galio-framework";
import React, { Component, PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

class StoryThumb extends PureComponent {
  render() {
    console.log(this.props.avatar);

    return (
      <Block style={{ margin: 10 }}>
        <Image
          source={{ uri: this.props.avatar }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
          }}
        />
      </Block>
    );
  }
}
export default StoryThumb;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
