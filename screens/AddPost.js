import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  Alert,
  AsyncStorage,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { key } from "../googleAPIKey";
import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import * as firebase from "firebase";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getPosts } from "../constants/Images";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GoogleAutoComplete } from "react-native-google-autocomplete";
import LocationItem from "../components/LocationItem";
import * as VideoThumbnails from "expo-video-thumbnails";

const homePlace = {
  description: "Home",
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } },
};
const workPlace = {
  description: "Work",
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};
const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

class AddPost extends React.Component {
  user = firebase.auth().currentUser;
  firestoreUserRef = firebase
    .firestore()
    .collection("users")
    .doc(this.user.uid);
  firestorePostRef = firebase
    .firestore()
    .collection("posts")
    .doc(this.user.uid)
    .collection("userPosts");

  state = {
    location: {},
    caption: "",
    mediaFile: Images.galleryIcon,
    fileThumb: Images.galleryIcon,
    videoThumb: null,
    file: null,
    locationSelected: false,
    posting: false,
  };

  // Check wether the user has previously added any profile picture
  //    componentWillMount = async()=>{
  //     try {
  //         } catch (error) {
  //           console.log("Something went wrong", error);
  //         }
  //   }

  // Pick from Gallery
  chooseFromGallery = async () => {
    let mediaFile = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      videoQuality: 0.5,
      // aspect: [4, 3],
      quality: 0.4,
    });

    if (!mediaFile.cancelled) {
      // console.log(mediaFile);
      if (mediaFile.type == "video") {
        let thumb = this.generateThumbnail(mediaFile.uri);

        thumb.then((thumbnail) => {
          this.setState({ mediaFile: mediaFile.uri, file: mediaFile });
        });
      } else {
        this.setState({
          mediaFile: mediaFile.uri,
          file: mediaFile,
          fileThumb: mediaFile.uri,
        });
      }
    }
  };

  generateThumbnail = async (video) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(video, {
        time: 15000,
      });
      this.setState(
        { videoThumb: uri, fileThumb: uri },
        console.log("Video Thumbnail: ", uri)
      );
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  updateLocation = (loc) => {
    this.setState({ location: loc, locationSelected: true });
    console.log(loc);
  };

  addPost = () => {
    const { location, caption, mediaFile, file, videoThumb } = this.state;
    console.log(location, caption, mediaFile);
    this.setState({ posting: true });

    // 1. Add a post doc in the firestore first to get the post id
    // 2. Use this post id to store the mediafile in the cloud storage with this id
    // 3. If upload fails remove the the document added previously and show message

    this.firestorePostRef
      .add({
        // location: location,
        // caption: caption,
        // image: image
      })
      .then((post) => {
        this.uploadPost(file, mediaFile, post.id)
          .then(async () => {
            if (file.type == "video") {
              this.uploadThumb(videoThumb, post.id).then(async () => {
                let thumbRef = firebase
                  .storage()
                  .ref()
                  .child("postVideos/" + post.id + "thumb");

                let postFileRef = firebase
                  .storage()
                  .ref()
                  .child("postVideos/" + post.id);
                await postFileRef.getDownloadURL().then(async (url) => {
                  await thumbRef
                    .getDownloadURL()
                    .then((thumbUrl) => {
                      this.setState({ mediaFile: url });
                      this.firestorePostRef
                        .doc(post.id)
                        .set({
                          postId: post.id,
                          userId: this.user.uid,
                          location: location,
                          caption: caption,
                          image: thumbUrl,
                          video: url,
                          type: file.type,
                          time: firebase.firestore.FieldValue.serverTimestamp(),
                        })
                        .then(() => {
                          this.setState({ posting: false });
                          alert("Post Added Successfully!");
                          this.setState({
                            location: {},
                            caption: "",
                            mediaFile: Images.galleryIcon,
                            locationSelected: false,
                          });

                          this.props.navigation.navigate("Profile");
                          console.log(this.state);
                        })
                        .catch((err) => {
                          alert(err);
                        });
                    })
                    .catch((error) => {
                      this.firestorePostRef.doc(post.id).delete();
                      console.log(error);
                      alert("Please select a file first");
                    });
                });
              });
            } else {
              postFileRef = firebase
                .storage()
                .ref()
                .child("postImages/" + post.id);
              await postFileRef
                .getDownloadURL()
                .then((url) => {
                  this.setState({ mediaFile: url });
                  this.firestorePostRef
                    .doc(post.id)
                    .set({
                      postId: post.id,
                      userId: this.user.uid,
                      location: location,
                      caption: caption,
                      image: url,
                      type: file.type,
                      time: firebase.firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                      this.setState({ posting: false });
                      alert("Post Added Successfully!");
                      this.setState({
                        location: {},
                        caption: "",
                        mediaFile: Images.galleryIcon,
                        locationSelected: false,
                      });

                      this.props.navigation.navigate("Profile");
                      console.log(this.state);
                    })
                    .catch((err) => {
                      alert(err);
                    });
                })
                .catch((error) => {
                  this.firestorePostRef.doc(post.id).delete();
                  console.log(error);
                  alert("Please select a file first");
                });
            }
          })
          .catch((err) => {
            alert(err);
          });
      });
  };

  uploadThumb = async (uri, filename) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = firebase
      .storage()
      .ref()
      .child("postVideos/" + filename + "thumb");
    return ref.put(blob);
  };

  uploadPost = async (file, uri, fileName) => {
    if (uri == Images.galleryIcon) {
      return false;
    } else {
      const response = await fetch(uri);
      let blob;
      let ref;
      if (file.type == "video") {
        ref = firebase
          .storage()
          .ref()
          .child("postVideos/" + fileName);
        blob = new Blob([uri + ".mov"], { type: "video/mov" });
        return ref.put(blob);
      } else {
        ref = firebase
          .storage()
          .ref()
          .child("postImages/" + fileName);
        blob = await response.blob();
        return ref.put(blob);
      }
    }
  };

  render() {
    let { fileThumb } = this.state;

    return (
      <Block style={styles.profileCard}>
        <Block middle row space="evenly" style={{ paddingBottom: 24 }}>
          <Block middle style={styles.avatarContainer}>
            <TouchableOpacity onPress={this.chooseFromGallery}>
              <Image source={{ uri: fileThumb }} style={styles.avatar} onLong />
            </TouchableOpacity>
          </Block>

          <Block flex center>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior="padding"
              enabled
            >
              <Block width={width * 0.6} style={{ marginBottom: 15 }}>
                <Input
                  borderless
                  style={{ height: 80 }}
                  maxLength={60}
                  multiline={true}
                  placeholder="Caption"
                  onChangeText={(caption) => this.setState({ caption })}
                  value={this.state.caption}
                  iconContent={
                    <Icon
                      size={15}
                      color={argonTheme.COLORS.ICON}
                      name="short-text"
                      family="MaterialIcons"
                      style={styles.inputIcons}
                    />
                  }
                />
              </Block>
            </KeyboardAvoidingView>
          </Block>
        </Block>

        {/* <Block row>
          <Block width={width * 0.8} style={{ marginBottom: 15 }}>
            <GoogleAutoComplete
              apiKey={key}
              debounce={500}
              minLength={2}
              radius="500"
              queryTypes={"(regions)"}
            >
              {({
                inputValue,
                handleTextChange,
                locationResults,
                fetchDetails,
                isSearching,
                clearSearch,
              }) => (
                <React.Fragment>
                  {console.log(locationResults)
                                        } 
                  <Input
                    style={styles.location}
                    placeholder="Location"
                    // onChangeText={location => this.setState({ location })}
                    onChangeText={handleTextChange}
                    onFocus={() => {
                      this.setState({ location: {}, locationSelected: false });
                    }}
                    value={this.state.location.locationName}
                    iconContent={
                      <Icon
                        size={16}
                        color={argonTheme.COLORS.ICON}
                        name="location"
                        family="EvilIcons"
                        style={styles.inputIcons}
                      />
                    }
                  />

                  {isSearching && <ActivityIndicator size="large" />}

                  {!this.state.locationSelected && (
                    <ScrollView style={{ maxHeight: 100 }}>
                      {locationResults.map((el, i) => (
                        <LocationItem
                          {...el}
                          updateLocation={this.updateLocation}
                          fetchDetails={fetchDetails}
                          clearSearch={clearSearch}
                          key={String(i)}
                        />
                      ))}
                    </ScrollView>
                  )}
                </React.Fragment>
              )}
            </GoogleAutoComplete>
          </Block>
        </Block> */}

        <Block>
          <Button
            small
            shadowless={false}
            icon="edit"
            iconFamily="AntDesign"
            style={{ marginTop: 15, backgroundColor: "#87888a" }}
            onPress={this.addPost}
          >
            Post
          </Button>
        </Block>

        {this.state.posting && (
          <Block style={{ marginTop: 10 }}>
            <ActivityIndicator size="large" />
          </Block>
        )}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1,
  },
  profileBackground: {
    width: width,
    height: height / 2,
  },
  profileCard: {
    position: "relative",
    padding: theme.SIZES.BASE / 2,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 30,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: theme.COLORS.WHITE,

    zIndex: 2,
  },
  info: {
    paddingHorizontal: 40,
  },
  location: {
    height: 48,
    // width: width - 32,
    // marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    borderColor: "#ebebeb",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 5,
    borderWidth: 0,
  },

  inputIcons: {
    marginRight: 12,
  },
  nameInfo: {
    marginTop: 35,
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchItem: {
    height: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
});

export default AddPost;
