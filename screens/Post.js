import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block, theme } from "galio-framework";

import { Card, Button } from "../components";
import articles from "../constants/articles";
import { logOut } from "../services/auth.service";

const { width, height } = Dimensions.get("screen");

class Post extends React.Component {
  constructor(props) {
    super(props);
  }

  renderArticles = () => {
    const { navigation } = this.props;

    const article = {
      username: navigation.getParam("username"),
      userId: navigation.getParam("userId"),
      title: navigation.getParam("title"),
      avatar: navigation.getParam("avatar"),
      image: navigation.getParam("image"),
      video: navigation.getParam("video"),
      type: navigation.getParam("type"),
      cta: navigation.getParam("cta"),
      caption: navigation.getParam("caption"),
      location: navigation.getParam("location"),
      postId: navigation.getParam("postId"),
      horizontal: true,
    };
    console.log(article);
    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.article}>
        <Block flex>
          <Card item={article} for={"feed"} full />
        </Block>
      </ScrollView>
    );
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderArticles()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  articles: {
    width: width,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default Post;
