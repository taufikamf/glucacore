import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ViewStyle,
	TextStyle,
} from "react-native";
import { COLORS, SIZES, FONTS } from "../../constants/theme";

interface Props {
	title: string;
	onPress?: () => void;
	color?: string;
	style?: ViewStyle;
	size?: any;
	text?: any;
	border?: any;
	disabled?: boolean;
	textStyle?: TextStyle;
}

const Button = ({
	title,
	onPress,
	color,
	style,
	size,
	text,
	border,
	disabled,
	textStyle,
}: Props) => {
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={onPress}
			disabled={disabled}
			style={[
				border && { borderColor: border, borderWidth: 1, borderRadius: 35 },
				styles.button,
				color && {
					backgroundColor: color,
				},
				size === "sm" && {
					height: 36,
					paddingHorizontal: 10,
					borderRadius: 4,
				},
				size === "lg" && {
					height: 55,
					paddingHorizontal: 30,
				},
				style && { ...style },
				disabled && styles.disabled,
			]}
		>
			<Text
				style={[
					styles.buttnTitle,
					size === "sm" && {
						fontSize: 14,
					},
					size === "lg" && {
						fontSize: 18,
					},
					color && { color: COLORS.white },
					text && { color: text },
					textStyle,
				]}
			>
				{title}
			</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: COLORS.primary,
		height: 60,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	buttnTitle: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#fff",
		lineHeight: 24,
		textTransform: "uppercase",
	},
	disabled: {
		opacity: 0.5,
	},
});

export default Button;
