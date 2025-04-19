import React, { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme";

type AuthGuardNavigationProp = StackNavigationProp<RootStackParamList>;

interface AuthGuardProps {
	children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();
	const navigation = useNavigation<AuthGuardNavigationProp>();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			// User is not authenticated, redirect to signin
			navigation.reset({
				index: 0,
				routes: [{ name: "SingIn" }],
			});
		}
	}, [isAuthenticated, isLoading, navigation]);

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	if (!isAuthenticated) {
		// Don't render children if not authenticated - the redirect will happen in the useEffect
		return null;
	}

	// User is authenticated, render children
	return <>{children}</>;
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.white,
	},
});

export default AuthGuard;
