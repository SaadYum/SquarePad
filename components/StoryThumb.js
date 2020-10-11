import { Block, Icon } from "galio-framework";
import React, { Component, PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Story from "./Story";
const { width, height } = Dimensions.get("screen");

class StoryThumb extends PureComponent {
  state = {
    modalVisible: false,
  };

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  };

  renderModal = () => {
    return (
      <Block>
        <View style={styles.centeredView}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              alert("Modal has been closed.");
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {/* <Text style={styles.modalText}>Hello World!</Text> */}
                <Block row>
                  <Image
                    source={{
                      uri: this.props.avatar,
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                    }}
                  />
                  <Text style={{ paddingTop: 10, paddingLeft: 10 }}>
                    {this.props.stories.username}
                  </Text>
                  <TouchableOpacity
                    style={{
                      ...styles.openButton,
                      marginLeft: width * 0.4,
                      backgroundColor: "#ebebeb",
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      this.toggleModal();
                    }}
                  >
                    <Icon
                      family="antdesign"
                      size={20}
                      name="close"
                      color={"black"}
                    />
                  </TouchableOpacity>
                </Block>
                <Story stories={this.props.stories} />
              </View>
            </View>
          </Modal>
        </View>
      </Block>
    );
  };

  render() {
    return (
      <Block>
        <Block style={{ margin: 5 }}>
          <TouchableOpacity
            onPress={() => {
              this.toggleModal();
            }}
            onLongPress={() => {
              if (this.props.myStory) {
                this.props.addStory();
              }
            }}
          >
            <Image
              source={{ uri: this.props.avatar }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
              }}
            />
          </TouchableOpacity>
        </Block>
        {this.state.modalVisible ? this.renderModal() : !this.renderModal()}
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
