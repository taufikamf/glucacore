import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { COLORS, FONTS } from "../constants/theme";

interface LoadingScreenProps {
	message?: string;
}

const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={COLORS.primary} />
			<Text style={styles.message}>{message}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.9)",
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 999,
	},
	message: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: COLORS.primary,
		marginTop: 12,
	},
});

export default LoadingScreen;
