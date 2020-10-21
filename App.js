import React from "react";
import { enableScreens, useScreens } from "react-native-screens";
import SquarePadApp from "./src/SquarePadApp";
import { Provider } from 'react-redux'
import configureStore from "./src/store";

enableScreens();

export default class App extends React.Component {
  
  store = configureStore();
  render() {
return(
  <Provider store={this.store}>
    
    <SquarePadApp />
  </Provider>
  );
  }
}