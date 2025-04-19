import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";

type AuthWrapperNavigationProp = StackNavigationProp<RootStackParamList>;

interface AuthWrapperProps {
	children: React.ReactNode;
}

/**
 * AuthWrapper is used for screens that should only be accessible when a user is NOT authenticated.
 * If a user is authenticated, they will be redirected to the main app.
 */
const AuthWrapper = ({ children }: AuthWrapperProps) => {
	const { isAuthenticated, isLoading } = useAuth();
	const navigation = useNavigation<AuthWrapperNavigationProp>();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			// User is already authenticated, redirect to main app
			navigation.reset({
				index: 0,
				routes: [{ name: "BottomNavigation" }],
			});
		}
	}, [isAuthenticated, isLoading, navigation]);

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: COLORS.white,
				}}
			>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	// Only render children if user is not authenticated
	if (!isAuthenticated) {
		return <>{children}</>;
	}

	// Return null if user is authenticated (the redirect will happen in useEffect)
	return null;
};

export default AuthWrapper;
