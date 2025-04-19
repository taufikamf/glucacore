import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	ScrollView,
	StyleSheet,
	Alert,
} from "react-native";
import React, { useState } from "react";
import { COLORS, FONTS } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { useTheme } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import Input from "../../components/Input/Input";
import { IMAGES } from "../../constants/Images";
import Button from "../../components/Button/Button";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import LoadingScreen from "../../components/LoadingScreen";
import { useAuth } from "../../context/AuthContext";

type SingInScreenProps = StackScreenProps<RootStackParamList, "SingIn">;

const SingIn = ({ navigation }: SingInScreenProps) => {
	const theme = useTheme();
	const { colors }: { colors: any } = theme;
	const { signIn, isLoading: authLoading } = useAuth();

	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const [isFocused, setisFocused] = useState(false);
	const [isFocused2, setisFocused2] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleLogin = async () => {
		if (!formData.username || !formData.password) {
			Alert.alert("Error", "Mohon isi semua field");
			return;
		}

		setIsLoading(true);
		try {
			const email = `${formData.username}@gmail.com`;
			await signIn(email, formData.password);

			// Success - navigation will be handled by SplashScreen based on auth state
			navigation.reset({
				index: 0,
				routes: [{ name: "BottomNavigation" }],
			});
		} catch (error: any) {
			console.error("Error signing in:", error);
			let errorMessage = "Gagal masuk. Silakan coba lagi.";

			if (error.code === "auth/user-not-found") {
				errorMessage = "Username tidak ditemukan";
			} else if (error.code === "auth/wrong-password") {
				errorMessage = "Kata sandi salah";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "Format email tidak valid";
			} else if (error.code === "auth/invalid-credential") {
				errorMessage = "Email atau Kata sandi salah";
			} else if (error.message) {
				errorMessage = error.message;
			}

			Alert.alert("Error", errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
			{isLoading && <LoadingScreen message="Sedang masuk..." />}

			<View
				style={[
					GlobalStyleSheet.container,
					{
						justifyContent: "center",
						alignItems: "center",
						paddingVertical: 50,
					},
				]}
			>
				<Image
					style={{ resizeMode: "contain", height: 100, width: 250 }}
					source={theme.dark ? IMAGES.logoImage : IMAGES.logoImage}
				/>
			</View>
			<ScrollView style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
				<View
					style={[
						GlobalStyleSheet.container,
						{
							flexGrow: 1,
							paddingBottom: 0,
							paddingHorizontal: 30,
							paddingTop: 0,
						},
					]}
				>
					<View style={{}}>
						<View style={{ marginBottom: 30 }}>
							<Text style={[styles.title1, { color: colors.title }]}>
								Halo !
							</Text>
							<Text style={[styles.title2, { color: colors.title }]}>
								Silahkan masuk ke akun anda !
							</Text>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								Username
							</Text>
						</View>
						<View style={{ marginBottom: 20, marginTop: 10 }}>
							<Input
								onFocus={() => setisFocused(true)}
								onBlur={() => setisFocused(false)}
								onChangeText={(value) => handleInputChange("username", value)}
								isFocused={isFocused}
								inputBorder
								placeholder="Masukkan username"
							/>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								Kata Sandi
							</Text>
						</View>
						<View style={{ marginBottom: 10, marginTop: 10 }}>
							<Input
								onFocus={() => setisFocused2(true)}
								onBlur={() => setisFocused2(false)}
								backround={colors.card}
								onChangeText={(value) => handleInputChange("password", value)}
								isFocused={isFocused2}
								type={"password"}
								inputBorder
								placeholder="Masukkan kata sandi"
							/>
						</View>
					</View>
					<View style={{ marginTop: 30 }}>
						<Button
							title="Masuk"
							onPress={handleLogin}
							color={colors.bgBlue}
							text={colors.black}
							style={{ borderRadius: 52 }}
							disabled={isLoading}
						/>
						{/* <View
							style={[
								GlobalStyleSheet.flex,
								{
									marginBottom: 20,
									marginTop: 10,
									paddingHorizontal: 10,
									justifyContent: "flex-start",
									gap: 5,
								},
							]}
						>
							<Text style={[styles.text, { color: colors.title }]}>
								Lupa Kata Sandi?
							</Text>
							<TouchableOpacity
								activeOpacity={0.5}
								onPress={() => navigation.navigate("ForgotPassword")}
							>
								<Text
									style={{
										...FONTS.fontMedium,
										fontSize: 14,
										color: COLORS.primary,
									}}
								>
									Atur Ulang Sekarang
								</Text>
							</TouchableOpacity>
						</View> */}
						<View style={{ marginBottom: 15, marginTop: 20 }}>
							<Text
								style={[
									styles.title2,
									{ color: colors.title, textAlign: "center", opacity: 0.5 },
								]}
							>
								Tidak Punya Akun ?
							</Text>
						</View>
						<Button
							title={"Buat akun disini !"}
							onPress={() => navigation.navigate("SignUp")}
							text={COLORS.title}
							color={COLORS.secondary}
							style={{ borderRadius: 52 }}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	text: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: COLORS.title,
	},
	title1: {
		...FONTS.fontSemiBold,
		fontSize: 24,
		color: COLORS.title,
		marginBottom: 5,
	},
	title2: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: COLORS.title,
	},
	title3: {
		...FONTS.fontMedium,
		fontSize: 14,
		color: "#8A8A8A",
	},
});

export default SingIn;
