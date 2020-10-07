import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import PropTypes from "prop-types";
// import CameraRollPicker from "react-native-camera-roll-picker";
import NavBar, { NavButton, NavButtonText, NavTitle } from "react-native-nav";
import * as ImagePicker from "expo-image-picker";
import * as firebase from "firebase";
import { Icon } from "galio-framework";

export default class CustomActions extends React.Component {
  constructor(props) {
    super(props);
    this._images = [];
    this.state = {
      modalVisible: false,
    };
    this.onActionsPress = this.onActionsPress.bind(this);
    this.selectImages = this.selectImages.bind(this);
  }

  setImages(images) {
    this._images = images;
  }

  getImages() {
    return this._images;
  }

  setModalVisible(visible = false) {
    this.setState({ modalVisible: visible });
  }

  onActionsPress() {
    const options = ["Choose From Library", "Cancel"];
    // const options = ["Choose From Library", "Send Location", "Cancel"];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            // this.setModalVisible(true);
            this.choosePicture();
            break;
          //   case 1:
          //     navigator.geolocation.getCurrentPosition(
          //       (position) => {
          //         this.props.onSend({
          //           location: {
          //             latitude: position.coords.latitude,
          //             longitude: position.coords.longitude,
          //           },
          //         });
          //       },
          //       (error) => alert(error.message),
          //       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          //     );
          //     break;
          default:
        }
      }
    );
  }

  selectImages(images) {
    this.setImages(images);
  }

  renderNavBar() {
    return (
      <NavBar
        style={{
          statusBar: {
            backgroundColor: "#FFF",
          },
          navBar: {
            backgroundColor: "#FFF",
          },
        }}
      >
        <NavButton
          onPress={() => {
            this.setModalVisible(false);
          }}
        >
          <NavButtonText
            style={{
              color: "#000",
            }}
          >
            {"Cancel"}
          </NavButtonText>
        </NavButton>
        <NavTitle
          style={{
            color: "#000",
          }}
        >
          {"Camera Roll"}
        </NavTitle>
        <NavButton
          onPress={() => {
            this.setModalVisible(false);

            const images = this.getImages().map((image) => {
              return {
                image: image.uri,
              };
            });
            this.props.onSend(images);
            this.setImages([]);
          }}
        >
          <NavButtonText
            style={{
              color: "#000",
            }}
          >
            {"Send"}
          </NavButtonText>
        </NavButton>
      </NavBar>
    );
  }

  renderIcon() {
    if (this.props.icon) {
      return this.props.icon();
    }
    return (
      // <View style={[styles.wrapper, this.props.wrapperStyle]}>
      //   <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
      // </View>

      <Icon
        size={30}
        name="images"
        family="entypo"
        // style={{ top: 12 }}
        color={"black"}
      />
    );
  }

  choosePicture = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    // console.log(result);

    if (!result.cancelled) {
      let timestamp = new Date().getTime().toString();

      this.uploadMessagePicture(
        result.uri,
        "(" + firebase.auth().currentUser.uid + ")" + timestamp
      );
      //   alert("dddd");
    }
  };

  uploadMessagePicture = async (uri, imageName) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const ref = firebase
      .storage()
      .ref()
      .child("chatPics/" + imageName);
    ref
      .put(blob)
      .then(() => {
        ref.getDownloadURL().then((url) => {
          this.props.uploadMediaMessage(url);
          // console.log(url);
          // firebase.firestore().collection("users").doc(this.user.uid).set(
          //   {
          //     profilePic: url,
          //   },
          //   { merge: true }
          // );
          // return url;
        });
      })
      .catch((err) => alert(err));
  };

  render() {
    return (
      <TouchableOpacity
        style={[styles.container, this.props.containerStyle]}
        onPress={this.onActionsPress}
      >
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          {this.renderNavBar()}

          {/* <CameraRollPicker
            maximum={10}
            imagesPerRow={4}
            callback={this.selectImages}
            selected={[]}
          /> */}
        </Modal>
        {this.renderIcon()}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 30,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};

CustomActions.defaultProps = {
  onSend: () => {},
  options: {},
  icon: null,
  containerStyle: {},
  wrapperStyle: {},
  iconTextStyle: {},
};

CustomActions.propTypes = {
  onSend: PropTypes.func,
  options: PropTypes.object,
  icon: PropTypes.func,
  containerStyle: PropTypes.style,
  wrapperStyle: PropTypes.style,
  iconTextStyle: PropTypes.style,
};
