import React, { Component, PureComponent } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Block, Text } from "galio-framework";
import { Images } from "../constants";
import { TouchableOpacity } from "react-native";

class GroupCard extends PureComponent {
  render() {
    const { group, navigation } = this.props;
    console.log("GORI CATD", group);
    return (
      <TouchableOpacity
        onPress={() => {
          console.log("group", group);
          this.props.navigation.navigate("Group", { group: group });
        }}
      >
        <Block
          style={{
            height: 150,
            width: 130,
            //   marginLeft: 20,
            margin: 10,
            borderWidth: 0.5,
            borderColor: "#efefef",
            borderRadius: 10,
          }}
        >
          <Block flex={2}>
            <Image
              source={
                group.groupPhoto
                  ? { uri: group.groupPhoto }
                  : Images.groupFiller
              }
              style={{
                flex: 1,
                width: null,
                height: null,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                resizeMode: "cover",
              }}
            />
          </Block>
          <Block flex={0.5} style={{ paddingLeft: 10, paddingTop: 10 }}>
            <Text>{group.groupTitle}</Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}
export default GroupCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
