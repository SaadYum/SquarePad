import {
    createStackNavigator,
    createAppContainer,
  } from "react-navigation";
  
  import Interests from "../screens/Interests";
  
  
  
  const InterestsStack = createStackNavigator(
    {
      Interests: {screen: Interests}},
      {
      headerMode: 'none'
      }
  );
  
  
  
  export const InterestSelect = createStackNavigator({
    Interests:{ 
      screen: InterestsStack,
      navigationOptions:{
          title: "Interests"
      }
    }
  },
  { initialRouteName: 'Interests',
    }
  );
  
  
  // const AppContainer = createAppContainer(AppStack);
  // export default AppContainer;
  