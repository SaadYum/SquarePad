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
  SafeAreaView,
  KeyboardAvoidingView,
  FlatList
} from "react-native";
import { Button, Icon } from "../components";
import { Images, argonTheme } from "../constants";

import { Block, Text, theme, Input } from "galio-framework";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("screen");
const styles = StyleSheet.create({
    item: {
        backgroundColor: '#ff6347',
        borderRadius:5,
        padding: 10,
        height:100,
        width: width*0.35,
        marginVertical: 8,
        marginHorizontal: 10,
      },
      title: {
        fontSize: 20,
      },
});

export const IconButton = (props)=>{
    const {item, onSelect} = props;
    
    // console.log(item);
   return(
            <TouchableOpacity
            onPressIn={() => onSelect(item.id)}
            style={[
                styles.item,
            { opacity: item.selected ? 0.3 : 1, backgroundColor: item.color?item.color:'white' },
            ]}
        >
            <Block center>
                   {item.iconName &&
                    <Icon
                        size={50}
                        color={argonTheme.COLORS.ICON}
                        name={item.iconName}
                        family={item.iconFamily}
                        // style={}
                        />
                    }
                    <Text style={styles.title} >{item.name}</Text>
                </Block>
        </TouchableOpacity>
   );
}