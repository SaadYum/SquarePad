import React from 'react';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';
import { StyleSheet, Dimensions, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import GalioTheme,{ Block, Text, theme } from 'galio-framework';
import Icon from './Icon';

import { argonTheme } from '../constants';

const LikeButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('Pro')}>
    <Icon
      
      family="EvilIcons"
      size={30}
      name="heart"
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
    <Block middle style={styles.notify} />
  </TouchableOpacity>
);
const CommentButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('Pro')}>
    <Icon
      
      family="EvilIcons"
      size={30}
      name="comment"
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
    <Block middle style={styles.notify} />
  </TouchableOpacity>
);
const ShareButton = ({isWhite, style, navigation}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('Pro')}>
    <Icon
      
      family="EvilIcons"
      size={30}
      name="external-link"
      color={argonTheme.COLORS[isWhite ? 'WHITE' : 'ICON']}
    />
    <Block middle style={styles.notify} />
  </TouchableOpacity>
);

class Card extends React.Component {
renderButtons(){
  const { white, title, navigation } = this.props;
  return (
    <Block row >
    <LikeButton key='like-post' navigation={navigation} isWhite={white}  />
    <CommentButton key='comment-post' navigation={navigation} isWhite={white} />
    <ShareButton key='share-post' navigation={navigation} isWhite={white} />
    </Block>
    )
  
}
renderAvatar() {
  const { avatar, themeStyles , item } = this.props;
  if (!item.avatar) return null;

  return <Image source={{ uri: item.avatar }} style={themeStyles.avatar} />;
}


  render() {
    const { navigation, item, horizontal, full, style, ctaColor, imageStyle } = this.props;
    
    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.card, styles.shadow, style];
    const imgContainer = [styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles,
      styles.shadow
    ];

    return (
      <Block>
        <Block row={horizontal} card flex style={cardContainer}>
          <TouchableWithoutFeedback onPress={() => navigation.navigate('Pro')}>
            <Block flex style={imgContainer}>
              <Image source={{uri: item.image}} style={imageStyles} />
            </Block>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => navigation.navigate('Pro')}>
            <Block>
              <Block flex space="between" style={styles.cardDescription}>
                <Text size={14} style={styles.cardTitle}>{item.title}</Text>
                {/* <Text size={12} muted={!ctaColor} color={ctaColor || argonTheme.COLORS.ACTIVE} bold>{item.cta}</Text> */}
              </Block>
              <Block>
                {this.renderAvatar()}
              </Block>
            </Block>
          </TouchableWithoutFeedback>
          <Block>
            {this.renderButtons()}
          </Block>  
        </Block>
      </Block>
    );
  }
}

Card.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
}

Card.defaultProps = {
  card: true,
  shadow: true,
  borderless: false,
  styles: {},
  themeStyles:{},
  theme: GalioTheme,
};

const themeStyles = theme=> StyleSheet.create({
  avatar: {
    width: theme.SIZES.CARD_AVATAR_WIDTH,
    height: theme.SIZES.CARD_AVATAR_HEIGHT,
    borderRadius: theme.SIZES.CARD_AVATAR_RADIUS,
  }
})


const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 16
  },
  cardTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6
  },
  
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 122,
    width: 'auto',
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});

export default withNavigation(Card);