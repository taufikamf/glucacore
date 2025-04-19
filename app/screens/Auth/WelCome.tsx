import { View, Text, Image, ScrollView } from "react-native";
import React, { useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import { useTheme } from "@react-navigation/native";
import { IMAGES } from "../../constants/Images";
import { COLORS, FONTS } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import SocialBtn from "../../components/Socials/SocialBtn";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../components/Button/Button";

type WelComeScreenProps = StackScreenProps<RootStackParamList, "WelCome">;

const WelCome = ({ navigation }: WelComeScreenProps) => {
	const theme = useTheme();
	const { colors }: { colors: any } = theme;

	return (
		<View style={{ flex: 1, backgroundColor: colors.card }}>
			<Image style={styles.welcomeimage} source={IMAGES.regisElipse} />
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<View
					style={[
						GlobalStyleSheet.container,
						{ padding: 0, marginTop: 100, flex: 1 },
					]}
				>
					<Image
						style={{
							height: 200,
							width: 390,
							zIndex: 99,
						}}
						source={IMAGES.regisImage}
					/>
				</View>
				<View>
					<View
						style={[
							GlobalStyleSheet.container,
							{ paddingHorizontal: 35, paddingBottom: 50 },
						]}
					>
						<Text style={[styles.title, { color: colors.textBlue }]}>
							Mulai Kendalikan Diabetes Melitus !
						</Text>
						<View
							style={[
								GlobalStyleSheet.container,
								{
									padding: 0,
									paddingHorizontal: 30,
									paddingBottom: 30,
								},
							]}
						>
							<Button
								style={{ borderRadius: 52 }}
								color={colors.bgBlue}
								text={colors.black}
								border={colors.black}
								title="Masuk"
								onPress={() => navigation.navigate("SingIn")}
							/>
						</View>
						<View
							style={[
								GlobalStyleSheet.container,
								{
									padding: 0,
									paddingHorizontal: 30,
									paddingBottom: 30,
								},
							]}
						>
							<Button
								style={{ borderRadius: 52 }}
								color={colors.card}
								text={colors.black}
								border={colors.black}
								title="Buat Akun"
								onPress={() => navigation.navigate("SignUp")}
							/>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	welcomeimage: {
		width: "100%",
		height: "70%",
		position: "absolute",
		top: -150,
		left: 0,
		right: 0,
		bottom: 0,
	},
	title: {
		...FONTS.fontSemiBold,
		fontSize: 24,
		color: COLORS.title,
		textAlign: "center",
		paddingHorizontal: 30,
		paddingBottom: 20,
	},
});

export default WelCome;
