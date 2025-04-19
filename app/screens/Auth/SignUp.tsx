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
import React, { useState, useEffect } from "react";
import { COLORS, FONTS } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { useTheme } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import Input from "../../components/Input/Input";
import { IMAGES } from "../../constants/Images";
import Button from "../../components/Button/Button";
import { db } from "../../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import LoadingScreen from "../../components/LoadingScreen";
import { useAuth } from "../../context/AuthContext";

type SignUpScreenProps = StackScreenProps<RootStackParamList, "SignUp">;

const SignUp = ({ navigation }: SignUpScreenProps) => {
	const theme = useTheme();
	const { colors }: { colors: any } = theme;
	const { signUp } = useAuth();

	const initialFormData = {
		name: "",
		age: "",
		birthDate: "",
		gender: "",
		weight: "",
		height: "",
		username: "",
		phone: "",
		password: "",
	};

	const [formData, setFormData] = useState({
		name: "",
		age: "",
		birthDate: "",
		gender: "",
		weight: "",
		height: "",
		username: "",
		phone: "",
		password: "",
	});

	const [imt, setImt] = useState<number | null>(null);

	useEffect(() => {
		const isValid = Object.values(formData).every(
			(value) => value.trim() !== ""
		);
		setIsFormValid(isValid);
	}, [formData]);

	useEffect(() => {
		if (formData.weight && formData.height) {
			const weightNum = parseFloat(formData.weight);
			const heightNum = parseFloat(formData.height) / 100;
			if (weightNum > 0 && heightNum > 0) {
				const imtValue = weightNum / (heightNum * heightNum);
				setImt(parseFloat(imtValue.toFixed(2)));
			}
		}
	}, [formData.weight, formData.height]);

	const [isFormValid, setIsFormValid] = useState(false);

	const [isFocused, setisFocused] = useState(false);
	const [isFocused2, setisFocused2] = useState(false);
	const [isFocused3, setisFocused3] = useState(false);
	const [isFocusedName, setIsFocusedName] = useState(false);
	const [isFocusedAge, setIsFocusedAge] = useState(false);
	const [isFocusedBirthDate, setIsFocusedBirthDate] = useState(false);
	const [isFocusedGender, setIsFocusedGender] = useState(false);
	const [isFocusedWeight, setIsFocusedWeight] = useState(false);
	const [isFocusedHeight, setIsFocusedHeight] = useState(false);

	const [isLoading, setIsLoading] = useState(false);

	const convertToISO = (dateString: string) => {
		const [day, month, year] = dateString.split("/").map(Number);
		const date = new Date(year, month - 1, day);
		return date.toISOString();
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleRegister = async () => {
		if (!isFormValid) return;

		setIsLoading(true);
		try {
			// Basic validation
			if (formData.password.length < 6) {
				throw new Error("Kata sandi harus minimal 6 karakter");
			}

			if (formData.phone.length < 10) {
				throw new Error("Nomor telepon tidak valid");
			}

			const email = `${formData.username}@gmail.com`;

			// Create authentication user using our context
			const userCredential = await signUp(email, formData.password);

			formData.birthDate = convertToISO(formData.birthDate);

			// Add user data to Firestore
			const userData = {
				uid: userCredential.user.uid,
				...formData,
				imt,
				createdAt: new Date(),
				password: null,
			};

			await addDoc(collection(db, "users"), userData);

			setFormData(initialFormData);

			Alert.alert("Sukses", "Pendaftaran berhasil!", [
				{
					text: "OK",
					onPress: () => {
						// Navigation will be handled by our AuthGuard/SplashScreen based on auth state
					},
				},
			]);
		} catch (error: any) {
			console.error("Error registering user:", error);
			let errorMessage = "Gagal mendaftar. Silakan coba lagi.";

			if (error.code === "auth/email-already-in-use") {
				errorMessage = "Nomor telepon sudah terdaftar.";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "Format email tidak valid.";
			} else if (error.message) {
				errorMessage = error.message;
			}

			Alert.alert("Error", errorMessage, [{ text: "OK" }]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
			{isLoading && <LoadingScreen message="Mendaftarkan akun..." />}

			<View
				style={[
					GlobalStyleSheet.container,
					GlobalStyleSheet.flexcenter,
					{ paddingVertical: 50 },
				]}
			>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					activeOpacity={0.5}
					style={[
						styles.imagebackground,
						{
							backgroundColor: "#F6F6F6",
							zIndex: 99,
						},
					]}
				>
					<Feather name="arrow-left" size={24} color={COLORS.title} />
				</TouchableOpacity>
				<View style={{ flex: 1, alignItems: "center", marginLeft: -40 }}>
					<Image
						style={{ resizeMode: "contain", height: 80, width: 250 }}
						source={theme.dark ? IMAGES.splashImage : IMAGES.splashImage}
					/>
				</View>
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
								Buat Akun
							</Text>
							<Text style={[styles.title2, { color: colors.title }]}>
								Jangan khawatir, hanya kamu yang dapat melihat profil kamu,
								orang lain tidak bisa melihatnya
							</Text>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>Nama</Text>
						</View>
						<View style={{ marginBottom: 20, marginTop: 10 }}>
							<Input
								onFocus={() => setIsFocusedName(true)}
								onBlur={() => setIsFocusedName(false)}
								onChangeText={(value) => handleInputChange("name", value)}
								isFocused={isFocusedName}
								inputBorder
								placeholder="Masukkan nama lengkap"
							/>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>Umur</Text>
						</View>
						<View style={{ marginBottom: 20, marginTop: 10 }}>
							<Input
								onFocus={() => setIsFocusedAge(true)}
								onBlur={() => setIsFocusedAge(false)}
								onChangeText={(value) => handleInputChange("age", value)}
								isFocused={isFocusedAge}
								inputBorder
								keyboardType="numeric"
								placeholder="Masukkan umur"
							/>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								Tanggal Lahir
							</Text>
						</View>
						<View style={{ marginBottom: 20, marginTop: 10 }}>
							<Input
								onFocus={() => setIsFocusedBirthDate(true)}
								onBlur={() => setIsFocusedBirthDate(false)}
								onChangeText={(value) => handleInputChange("birthDate", value)}
								isFocused={isFocusedBirthDate}
								inputBorder
								placeholder="DD/MM/YYYY"
							/>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								Jenis Kelamin
							</Text>
						</View>
						<View style={styles.radioContainer}>
							<TouchableOpacity
								style={styles.radioOption}
								onPress={() => handleInputChange("gender", "Laki-laki")}
							>
								<View style={styles.radio}>
									{formData.gender === "Laki-laki" && (
										<View style={styles.radioSelected} />
									)}
								</View>
								<Text style={styles.radioText}>Laki-laki</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.radioOption}
								onPress={() => handleInputChange("gender", "Perempuan")}
							>
								<View style={styles.radio}>
									{formData.gender === "Perempuan" && (
										<View style={styles.radioSelected} />
									)}
								</View>
								<Text style={styles.radioText}>Perempuan</Text>
							</TouchableOpacity>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								Berat Badan (kg)
							</Text>
						</View>
						<View style={{ marginBottom: 20, marginTop: 10 }}>
							<Input
								onFocus={() => setIsFocusedWeight(true)}
								onBlur={() => setIsFocusedWeight(false)}
								onChangeText={(value) => handleInputChange("weight", value)}
								isFocused={isFocusedWeight}
								inputBorder
								keyboardType="numeric"
								placeholder="Masukkan berat badan"
							/>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								Tinggi Badan (cm)
							</Text>
						</View>
						<View style={{ marginBottom: 20, marginTop: 10 }}>
							<Input
								onFocus={() => setIsFocusedHeight(true)}
								onBlur={() => setIsFocusedHeight(false)}
								onChangeText={(value) => handleInputChange("height", value)}
								isFocused={isFocusedHeight}
								inputBorder
								keyboardType="numeric"
								placeholder="Masukkan tinggi badan"
							/>
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
								Nomor Telepon
							</Text>
						</View>
						<View style={{ marginBottom: 20, marginTop: 10 }}>
							<Input
								onFocus={() => setisFocused2(true)}
								onBlur={() => setisFocused2(false)}
								backround={colors.card}
								onChangeText={(value) => handleInputChange("phone", value)}
								isFocused={isFocused2}
								keyboardType="numeric"
								inputBorder
								placeholder="Masukkan nomor telepon"
							/>
						</View>
						<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								Kata Sandi
							</Text>
						</View>
						<View style={{ marginBottom: 10, marginTop: 10 }}>
							<Input
								onFocus={() => setisFocused3(true)}
								onBlur={() => setisFocused3(false)}
								backround={colors.card}
								onChangeText={(value) => handleInputChange("password", value)}
								isFocused={isFocused3}
								type={"password"}
								inputBorder
								placeholder="Masukkan kata sandi"
							/>
						</View>
					</View>
					{imt !== null && (
						<View style={styles.imtContainer}>
							<Text style={[styles.title3, { color: "#8A8A8A" }]}>
								IMT: {imt}
							</Text>
							<Text style={[styles.title2, { color: colors.title }]}>
								{imt < 18.5
									? "Berat badan kurang"
									: imt < 25
									? "Berat badan normal"
									: imt < 30
									? "Berat badan berlebih"
									: "Obesitas"}
							</Text>
						</View>
					)}
					<View style={{ marginTop: 30, marginBottom: 30 }}>
						<Button
							title={isLoading ? "Mendaftar..." : "Daftar"}
							color={colors.bgBlue}
							onPress={handleRegister}
							text={colors.black}
							style={{
								borderRadius: 52,
							}}
							disabled={!isFormValid || isLoading}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
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
	imagebackground: {
		height: 46,
		width: 46,
		borderRadius: 50,
		backgroundColor: "#F6F6F6",
		alignItems: "center",
		justifyContent: "center",
	},
	radioContainer: {
		flexDirection: "row",
		marginBottom: 20,
		marginTop: 10,
	},
	radioOption: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 30,
	},
	radio: {
		height: 20,
		width: 20,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#8A8A8A",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
	radioSelected: {
		height: 12,
		width: 12,
		borderRadius: 6,
		backgroundColor: COLORS.primary,
	},
	radioText: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#8A8A8A",
	},
	imtContainer: {
		marginVertical: 15,
		padding: 15,
		backgroundColor: "#F6F6F6",
		borderRadius: 8,
	},
});

export default SignUp;
