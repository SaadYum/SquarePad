import { Block } from "galio-framework";
import React, { Component, PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Carousel from "react-native-snap-carousel";
const { width, height } = Dimensions.get("screen");

class Story extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      carouselItems: [
        {
          title: "Item 1",
          text: "Text 1",
        },
        {
          title: "Item 2",
          text: "Text 2",
        },
        {
          title: "Item 3",
          text: "Text 3",
        },
        {
          title: "Item 4",
          text: "Text 4",
        },
        {
          title: "Item 5",
          text: "Text 5",
        },
      ],
    };
  }
  _renderItem({ item, index }) {
    return (
      <Block>
        <Image
          source={{
            uri: item.content,
          }}
          style={{
            width: width * 0.7,
            height: height * 0.7,
            borderRadius: 30,
          }}
        />
        <View
          style={{
            backgroundColor: "#ebebeb",
            borderRadius: 20,
            height: 25,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text>{item.uploaded}</Text>
        </View>
      </Block>
      //   <View
      //     style={{
      //       backgroundColor: "floralwhite",
      //       borderRadius: 5,
      //       height: 250,
      //       padding: 50,
      //       marginLeft: 25,
      //       marginRight: 25,
      //     }}
      //   >
      //     <Text style={{ fontSize: 30 }}>{item.title}</Text>
      //     <Text>{item.text}</Text>
      //   </View>
    );
  }
  render() {
    let { stories } = this.props.stories;
    return (
      <Block>
        <Block>
          <View
            // style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}
            style={{ flexDirection: "row", justifyContent: "center" }}
          >
            <Carousel
              layout={"default"}
              ref={(ref) => (this.carousel = ref)}
              data={stories}
              sliderWidth={300}
              itemWidth={300}
              renderItem={this._renderItem}
              onSnapToItem={(index) => this.setState({ activeIndex: index })}
            />
          </View>
        </Block>
      </Block>
    );
  }
}
export default Story;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
