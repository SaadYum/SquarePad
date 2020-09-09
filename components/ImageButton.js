import React from "react";
import { StyleSheet ,ActivityIndicator, TouchableWithoutFeedback, Image, Alert, Dimensions } from "react-native";
import PropTypes from 'prop-types';
import { Button, Block, Text } from "galio-framework";
import * as firebase from 'firebase';

import argonTheme from "../constants/Theme";
import { Images } from "../constants";
import { TouchableOpacity } from "react-native-gesture-handler";

const { height, width } = Dimensions.get('window')

class ImageButton extends React.Component {

  render() {
      const {color} = this.props;
    return(
        <TouchableOpacity style={{width:width*0.3, height:100, backgroundColor:"#f5f5f5", alignItems:'center'}}>
           <Image
                    source={{ uri: "https://images.squarespace-cdn.com/content/v1/5cf3e5270d21ab0001dbc76d/1559613378757-VPIWHN6MQZTLDMN7OIBB/ke17ZwdGBToddI8pDm48kGbVhASes7BYK4FE8cK_rMx7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QPOohDIaIeljMHgDF5CVlOqpeNLcJ80NK65_fV7S1UabE8RBZPTc-Bzxq9_DSGCqYS6hTks57eK54V2GtLxZWP7cJNZlDXbgJNE9ef52e8w/PC-website-elements-08.png?format=500w" }}
                    style={styles.buttonImage}
                    onLong
                  />
        </TouchableOpacity>

        // <TouchableOpacity style={styles.searchItem} onPress={this.handleDetailResults}> 
        //     <Text>{this.props.structured_formatting.main_text}</Text>
        //     {/* <Text>{el.}</Text> */}
        // </TouchableOpacity>
              
    );
  }
}



const styles = StyleSheet.create({
  smallButton: {
    width: 150,
    height: 30
  },

  buttonImage:{
    width: 90,
    height: 90,
    // align: 'center'

  },

  shadow: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  comment:{
    flex:1, paddingTop:8, paddingLeft: 10, marginLeft:5,
    height: 28,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor : '#fcfcfc',
    borderColor: '#fcfcfc'
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0
  },
  cardUsername:{
    paddingTop: 4
  },
  searchItem:{
    height: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "center"
  },
  cardUser: {
    fontFamily: 'Arial',
    fontWeight: "400",
    paddingTop: 8,
    paddingLeft: 4,
    color: argonTheme.COLORS.BLACK
  },
});

export default ImageButton;
