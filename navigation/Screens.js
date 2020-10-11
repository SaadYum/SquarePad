import React from "react";
import { Easing, Animated } from "react-native";
import {
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator,
  BottomTabBar,
  createAppContainer,
  createSwitchNavigator,
} from "react-navigation";

import { Block } from "galio-framework";

// screens
import Home from "../screens/Home";
import Onboarding from "../screens/Onboarding";
import Pro from "../screens/Pro";
import Profile from "../screens/Profile";
import Register from "../screens/Register";
import Login from "../screens/Login";

import Elements from "../screens/Elements";
import Articles from "../screens/Articles";
import Post from "../screens/Post";
// drawer
import Menu from "./Menu";
import DrawerItem from "../components/DrawerItem";

// header for screens
import Header from "../components/Header";

import Icon from "../components/Icon";
import UpdateProfile from "../screens/UpdateProfile";
import AddPost2 from "../screens/AddPost";
import AddPost from "../screens/AddPost";
import SearchUser from "../screens/SearchUser";
import userProfile from "../screens/userProfile";
import Maps from "../screens/Maps";
import Explore from "../screens/Explore";
import PlaceDetail from "../screens/PlaceDetail";
import PlanChoice from "../screens/PlanChoice";
import CreatePlan from "../screens/CreatePlan";
import EditMembers from "../screens/EditMembers";
import EditTodos from "../screens/EditTodos";
import Interests from "../screens/Interests";
import SpotDetail from "../screens/SpotDetail";
import ShareTour from "../screens/ShareTour";
import TourNavigation from "../screens/TourNavigation";
import MyPlans from "../screens/MyPlans";
import EditPlan from "../screens/EditPlan";
import StartTour from "../screens/StartTour";
import SelectMembers from "../screens/SelectMembers";
import RecommendedPlan from "../screens/RecommendedPlan";
import EditSpot from "../screens/EditSpot";
import Notifications from "../screens/Notifications";
import PlanChat from "../screens/PlanChat";
import MyChats from "../screens/MyChats";
import Chat from "../screens/Chat";
import Groups from "../screens/Groups";
import AddGroup from "../screens/AddGroup";
import Group from "../screens/Group";
import SharePost from "../screens/SharePost";
import EditGroup from "../screens/EditGroup";
import SharePlan from "../screens/SharePlan";
import PlanDetails from "../screens/PlanDetails";
import PlanJoinRequests from "../screens/PlanJoinRequests";
import ProfileSettings from "../screens/ProfileSettings";

const TabBarComponent = (props) => <BottomTabBar {...props} />;

const transitionConfig = (transitionProps, prevTransitionProps) => ({
  transitionSpec: {
    duration: 400,
    easing: Easing.out(Easing.poly(4)),
    timing: Animated.timing,
  },
  screenInterpolator: (sceneProps) => {
    const { layout, position, scene } = sceneProps;
    const thisSceneIndex = scene.index;
    const width = layout.initWidth;

    const scale = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [4, 1, 1],
    });
    const opacity = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [0, 1, 1],
    });
    const translateX = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex],
      outputRange: [width, 0],
    });

    const scaleWithOpacity = { opacity };
    const screenName = "Search";

    if (
      screenName === transitionProps.scene.route.routeName ||
      (prevTransitionProps &&
        screenName === prevTransitionProps.scene.route.routeName)
    ) {
      return scaleWithOpacity;
    }
    return { transform: [{ translateX }] };
  },
});

const ElementsStack = createStackNavigator(
  {
    Elements: {
      screen: Elements,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Elements" navigation={navigation} />,
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

const ArticlesStack = createStackNavigator(
  {
    Articles: {
      screen: Articles,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Articles" navigation={navigation} />,
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

const MapStack = createStackNavigator(
  {
    Maps: {
      screen: Maps,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Maps" navigation={navigation} />,
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

const ShareTourStack = createStackNavigator(
  {
    ShareTour: {
      screen: ShareTour,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="ShareTour" navigation={navigation} />,
      }),
    },
    TourNavigation: {
      screen: TourNavigation,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Touring" navigation={navigation} />,
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

const ChatStack = createStackNavigator(
  {
    MyChats: {
      screen: MyChats,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Messages" navigation={navigation} />,
      }),
    },
    Chat: {
      screen: Chat,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Chat" navigation={navigation} />,
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

const CreatePlanStack = createStackNavigator(
  {
    CreatePlan: {
      screen: CreatePlan,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Plan" navigation={navigation} />,
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

const ExploreStack = createStackNavigator(
  {
    Explore: {
      screen: Explore,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Explore" navigation={navigation} />,
      }),
    },
    Maps: {
      screen: Maps,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Maps" navigation={navigation} />,
      }),
    },

    PlaceDetail: {
      screen: PlaceDetail,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Details" navigation={navigation} />,
      }),
    },
    PlanChoice: {
      screen: PlanChoice,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Plan" navigation={navigation} />,
      }),
    },
    CreatePlan: {
      screen: CreatePlan,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="CreatePlan" navigation={navigation} />,
      }),
    },
    SpotDetail: {
      screen: SpotDetail,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="SpotDetails" navigation={navigation} />,
      }),
    },
    EditMembers: {
      screen: EditMembers,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Members" navigation={navigation} />,
      }),
    },
    EditTodos: {
      screen: EditTodos,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Todos" navigation={navigation} />,
      }),
    },
    SelectMembers: {
      screen: SelectMembers,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Members" navigation={navigation} />,
      }),
    },
    RecommendedPlan: {
      screen: RecommendedPlan,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Plan" navigation={navigation} />,
      }),
    },

    userProfile: {
      screen: userProfile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title="Profile"
            back
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: true,
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

// const profileScreen = createDrawerNavigator({
//   Profile: {
//     screen: Profile,
//     navigationOptions: (navOpt) => ({
//       drawerLabel: ({ focused }) => (
//         <DrawerItem focused={focused} screen="Profile" title="Profile" />
//       ),
//     }),
//   },
//   Update: {
//     screen: UpdateProfile,
//     navigationOptions: ({ navigation }) => ({
//       drawerLabel: ({ focused }) => (
//         <DrawerItem focused={focused} screen="Update Profile" title="Profile" />
//       ),
//     }),
//   },
//   LogOut: {
//     screen: UpdateProfile,
//     navigationOptions: ({ navigation }) => ({
//       drawerLabel: ({ focused }) => (
//         <DrawerItem focused={focused} title="Log out" />
//       ),
//     }),
//   },
// });

const ProfileStack = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Profile" iconColor={"#FFF"} navigation={navigation} />
        ),
        headerTransparent: true,
      }),
    },

    Post: {
      screen: Post,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title="Post"
            back
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: false,
      }),
    },

    Settings: {
      screen: ProfileSettings,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title="Settings"
            back
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: false,
      }),
    },

    Update: {
      screen: UpdateProfile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title="Update"
            back
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: false,
      }),
    },
    Interests: {
      screen: Interests,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Interests" navigation={navigation} />,
      }),
    },
  },
  {
    cardStyle: { backgroundColor: "#FFFFFF" },
    transitionConfig,
  }
);

const LoginStack = createStackNavigator({
  Login: {
    screen: Login,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header title="Profile" iconColor={"#FFF"} navigation={navigation} />
      ),
      headerTransparent: true,
    }),
  },
});

const RegisterStack = createStackNavigator({
  Register: {
    screen: Register,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header title="Profile" iconColor={"#FFF"} navigation={navigation} />
      ),
      headerTransparent: true,
    }),
  },
});
const UpdateStack = createStackNavigator({
  Register: {
    screen: UpdateProfile,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header
          title="Update"
          back
          iconColor={"#FFF"}
          navigation={navigation}
        />
      ),
      // headerTransparent: true
    }),
  },
});
const AddPostStack = createStackNavigator({
  AddPost: {
    screen: AddPost,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header title="New Post" iconColor={"#FFF"} navigation={navigation} />
      ),
      headerTransparent: false,
    }),
  },
});
const SearchUserStack = createStackNavigator({
  SearchUser: {
    screen: SearchUser,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header title="Users" iconColor={"#FFF"} navigation={navigation} />
      ),
      headerTransparent: false,
    }),
  },
  userPost: {
    screen: Post,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header title="Post" back iconColor={"#FFF"} navigation={navigation} />
      ),
      headerTransparent: false,
    }),
  },
  userProfile: {
    screen: userProfile,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header
          title="Profile"
          back
          iconColor={"#FFF"}
          navigation={navigation}
        />
      ),
      headerTransparent: true,
    }),
  },
});

const GroupStack = createStackNavigator(
  {
    Groups: {
      screen: Groups,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title=""
            white
            transparent
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: true,
      }),
    },
    AddGroup: {
      screen: AddGroup,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title=""
            white
            back
            transparent
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: true,
      }),
    },
    Group: {
      screen: Group,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title=""
            white
            back
            transparent
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: true,
      }),
    },
    EditGroup: {
      screen: EditGroup,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title=""
            white
            back
            transparent
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: true,
      }),
    },
    SharePost: {
      screen: SharePost,
      navigationOptions: ({ navigation }) => ({
        // header: (
        //   <Header
        //     title=""
        //     white
        //     back
        //     transparent
        //     iconColor={"#FFF"}
        //     navigation={navigation}
        //   />
        // ),
        headerTransparent: true,
      }),
    },
    SharePlan: {
      screen: SharePlan,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title=""
            white
            back
            transparent
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: true,
      }),
    },
  },
  {
    cardStyle: { backgroundColor: "#ffffff" },
    transitionConfig,
  }
);

const HomeStack = createStackNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Home" navigation={navigation} />,
      }),
    },
    MyChats: {
      screen: MyChats,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Messages" navigation={navigation} />,
      }),
    },
    Chat: {
      screen: Chat,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Chat" navigation={navigation} />,
      }),
    },
    Notifications: {
      screen: Notifications,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Notifications" navigation={navigation} />,
      }),
    },
    NotificationPost: {
      screen: Post,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header
            title="Post"
            back
            iconColor={"#FFF"}
            navigation={navigation}
          />
        ),
        headerTransparent: false,
      }),
    },
    NotificationPlans: {
      screen: MyPlans,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="My Plans" navigation={navigation} />,
      }),
    },
    PlanDetails: {
      screen: PlanDetails,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Details" navigation={navigation} />,
      }),
    },
    EditPlan: {
      screen: EditPlan,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Edit Plan" navigation={navigation} />,
      }),
    },

    EditSpot: {
      screen: EditSpot,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="EditSpot" navigation={navigation} />,
      }),
    },
    EditMembers: {
      screen: EditMembers,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Members" navigation={navigation} />,
      }),
    },
    EditTodos: {
      screen: EditTodos,
      navigationOptions: ({ navigation }) => ({
        header: <Header back title="Todos" navigation={navigation} />,
      }),
    },
    StartTour: {
      screen: StartTour,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header transparent back title="Tour" navigation={navigation} />
        ),
      }),
    },
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF",
    },
    transitionConfig,
  }
);

export const SignedIn = createBottomTabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: {
        // tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="AntDesign" size={20} color={tintColor} name="home" />
        ),
      },
    },
    Chats: {
      screen: ChatStack,
      navigationOptions: {
        // tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <Icon
            family="AntDesign"
            size={20}
            color={tintColor}
            name="message1"
          />
        ),
      },
    },
    Maps: {
      screen: MapStack,
      navigationOptions: {
        // tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="Feather" size={20} color={tintColor} name="map" />
        ),
      },
    },
    CreatePlan: {
      screen: CreatePlanStack,
      navigationOptions: {
        // tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="Feather" size={20} color={tintColor} name="map" />
        ),
      },
    },
    // Explore: {
    //   screen: ExploreStack,
    //   navigationOptions: {
    //     // tabBarLabel: 'Home',
    //     tabBarIcon: ({ tintColor }) => (
    //       <Icon family="Feather" size={20} color={tintColor} name="map" />
    //     ),
    //   },
    // },

    Profile: {
      screen: ProfileStack,
      navigationOptions: {
        // tabBarLabel: 'Profile',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="AntDesign" size={20} color={tintColor} name="user" />
        ),
      },
    },

    ShareTour: {
      screen: ShareTourStack,
      navigationOptions: {
        // tabBarLabel: 'Profile',
        tabBarIcon: ({ tintColor }) => (
          <Icon
            family="AntDesign"
            size={20}
            color={tintColor}
            name="addusergroup"
          />
        ),
      },
    },

    Update: {
      screen: UpdateStack,
      navigationOptions: {
        // tabBarLabel: 'Update',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="AntDesign" size={20} color={tintColor} name="user" />
        ),
      },
    },
    Add: {
      screen: AddPostStack,
      navigationOptions: {
        // tabBarLabel: 'Add Post',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="AntDesign" size={20} color={tintColor} name="camera" />
        ),
      },
    },
    Explore: {
      screen: SearchUserStack,
      navigationOptions: {
        // tabBarLabel: 'Add Post',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="AntDesign" size={20} color={tintColor} name="search1" />
        ),
      },
    },
    Groups: {
      screen: GroupStack,
      navigationOptions: {
        // tabBarLabel: 'Add Post',
        tabBarIcon: ({ tintColor }) => (
          <Icon family="Entypo" size={20} color={tintColor} name="users" />
        ),
      },
    },

    // Chat: {
    //   screen: ChatStack,
    //   navigationOptions: {
    //     // tabBarLabel: 'Add Post',
    //     tabBarIcon: ({ tintColor }) => (
    //       <Icon family="AntDesign" size={20} color={tintColor} name="search1" />
    //     ),
    //   },
    // },
  },
  {
    order: ["Home", "Explore", "Add", "Chats", "Profile"],
    animationEnabled: true,
    initialRouteName: "Home",
    navigationOptions: {
      tabBarVisible: true,
    },
    tabBarOptions: {
      activeTintColor: "tomato",
      inactiveTintColor: "gray",
    },
    tabBarComponent: (props) => (
      <TabBarComponent
        {...props}
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopColor: "whitesmoke",
          backgroundColor: "whitesmoke",
          overflow: "hidden",
        }}
      />
    ),
  }
);

// const AppContainer = createAppContainer(AppStack);
// export default AppContainer;
