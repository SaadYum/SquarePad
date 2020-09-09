import {
  createStackNavigator,
  createAppContainer,
} from "react-navigation";

import Register from "../screens/Register";
import Login from "../screens/Login";



const LoginStack = createStackNavigator(
  {
    Login: {screen: Login}},
    {
    headerMode: 'none'
    }
);

const RegisterStack = createStackNavigator(
  {
    Register: {screen: Register}},
    {
    headerMode: 'none'
    }
);


export const SignedOut = createStackNavigator({
  Account:{ 
    screen: LoginStack,
    navigationOptions:{
        title: "Login"
    }
  },
  AccountRegister:{ 
    screen: RegisterStack,
    navigationOptions:{
        title: "Sign Up"
    }
  },
},
{ initialRouteName: 'Account',
  }
);


// const AppContainer = createAppContainer(AppStack);
// export default AppContainer;
