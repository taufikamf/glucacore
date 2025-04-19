import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { IMAGES } from "../constants/Images";
import { COLORS } from "../constants/theme";
import { auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

const SplashScreen = ({ navigation }: any) => {
	const { user, isLoading: authLoading } = useAuth();
	const [splashTimeout, setSplashTimeout] = useState(true);

	useEffect(() => {
		// Show splash screen for at least 2 seconds
		const timer = setTimeout(() => {
			setSplashTimeout(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	// Wait for both auth to be checked and minimum splash time
	useEffect(() => {
		if (!authLoading && !splashTimeout) {
			if (user) {
				// User is signed in, navigate to BottomNavigation
				navigation.reset({
					index: 0,
					routes: [{ name: "BottomNavigation" }],
				});
			} else {
				// No user is signed in, navigate to Onboarding
				navigation.reset({
					index: 0,
					routes: [{ name: "Onboarding" }],
				});
			}
		}
	}, [authLoading, splashTimeout, user, navigation]);

	return (
		<View style={styles.container}>
			<Image
				source={IMAGES.splashImage}
				style={styles.logo}
				resizeMode="contain"
			/>
			<ActivityIndicator
				size="large"
				color={COLORS.primary}
				style={styles.loader}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.white,
	},
	logo: {
		width: 250,
		height: 250,
	},
	loader: {
		marginTop: 20,
	},
});

export default SplashScreen;
