import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabParamList } from "./BottomTabParamList";
import HomeScreen from "../screens/Home/Home";
import ProfileScreen from "../screens/Profile/Profile";
import JournalScreen from "../screens/Journal/Journal";
import BottomMenu from "../layout/BottomMenu";
import { useTheme } from "@react-navigation/native";

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomNavigation = () => {
	const theme = useTheme();
	const { colors }: { colors: any } = theme;

	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={{
				headerShown: false,
			}}
			tabBar={(props: any) => <BottomMenu {...props} />}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Journal" component={JournalScreen} />
			<Tab.Screen name="Profile" component={ProfileScreen} />
		</Tab.Navigator>
	);
};

export default BottomNavigation;
