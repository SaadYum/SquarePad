import { Video } from "expo-av";
import React from "react";
import { Dimensions, View } from "react-native";

const { width } = Dimensions.get("screen");
const { height } = Dimensions.get("screen");

class ChatVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      video: this.props.navigation.getParam("video"),
    };
  }
  render() {
    return (
      <View>
        <Video
          source={{ uri: this.state.video }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          // shouldPlay
          // isLooping
          useNativeControls
          style={{ width: width, height: height * 0.8 }}
        />
      </View>
    );
  }
}

export default ChatVideo;
