import {SignedIn} from './Screens';
import {SignedOut} from "./CheckScreens"
import {InterestSelect} from "./InterestScreen"
import { createSwitchNavigator, createAppContainer } from 'react-navigation';


export const AppStack = (signedIn, interestsComplete) => { return createSwitchNavigator({
    SignedIn : { screen: SignedIn},
    SignedOut : { screen: SignedOut},
    InterestSelect: {screen: InterestSelect}
  }
  ,
  {
    initialRouteName: signedIn ? interestsComplete? "SignedIn" : "InterestSelect"  : "SignedOut"
  })};

  
// const AppContainer = (signedIn = false) => { return createAppContainer(AppStack)};
// export default AppContainer;
  
  