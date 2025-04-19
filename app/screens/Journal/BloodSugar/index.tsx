import React, { useState, useEffect } from "react";
import {
	SafeAreaView,
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Image,
	TextInput,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS } from "../../../constants/theme";
import { IMAGES } from "../../../constants/Images";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { Picker } from "@react-native-picker/picker";

// Skeleton loading component for blood sugar form
const BloodSugarSkeleton = () => {
	return (
		<>
			<View style={styles.section}>
				<View style={styles.skeletonSectionTitle} />
				<View style={styles.skeletonInput} />
				<View style={styles.skeletonStatus} />
			</View>

			<View style={styles.section}>
				<View style={styles.skeletonSectionTitle} />
				<View style={styles.skeletonPicker} />
			</View>

			<View style={styles.section}>
				<View style={styles.skeletonSectionTitle} />
				<View style={styles.skeletonInput} />
			</View>

			<View style={styles.section}>
				<View style={styles.skeletonSectionTitle} />
				<View style={styles.skeletonTextArea} />
			</View>
		</>
	);
};

const BloodSugarScreen = ({ navigation, route }: any) => {
	const theme = useTheme();
	const { colors } = theme;
	const {
		date,
		journalType = "blood_sugar",
		title = "Kadar Gula Darah",
	} = route.params || {
		date: new Date().toISOString().split("T")[0],
		journalType: "blood_sugar",
		title: "Kadar Gula Darah",
	};

	const [glucoseLevel, setGlucoseLevel] = useState("");
	const [measurementType, setMeasurementType] = useState("Sebelum Makan");
	const [measurementTime, setMeasurementTime] = useState("");
	const [notes, setNotes] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	// Format date for display
	const formatDisplayDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return new Date(dateString).toLocaleDateString("id-ID", options);
	};

	// Navigate directly to Journal screen
	const handleBack = () => {
		// Navigate to the Journal tab in BottomNavigation
		navigation.navigate("BottomNavigation", {
			screen: "Journal",
		});
	};

	// Determine blood sugar status based on glucose level and measurement type
	const getBloodSugarStatus = () => {
		const level = Number(glucoseLevel);
		if (!level) return { text: "N/A", color: "#999" };

		if (measurementType === "Sebelum Makan" || measurementType === "Puasa") {
			if (level < 70) return { text: "Rendah", color: "#FFA500" };
			if (level <= 100) return { text: "Normal", color: "#4CAF50" };
			if (level <= 125) return { text: "Pra-diabetes", color: "#FFA500" };
			return { text: "Tinggi", color: "#F44336" };
		} else {
			// After meal or random
			if (level < 70) return { text: "Rendah", color: "#FFA500" };
			if (level <= 140) return { text: "Normal", color: "#4CAF50" };
			if (level <= 199) return { text: "Pra-diabetes", color: "#FFA500" };
			return { text: "Tinggi", color: "#F44336" };
		}
	};

	// Load existing blood sugar data
	const loadBloodSugarData = async () => {
		if (!auth.currentUser) return;

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Use the activities collection structure shown in the image
			const bloodSugarRef = doc(db, `activities/${userId}/blood_sugar/${date}`);
			const docSnap = await getDoc(bloodSugarRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				// Updated field names to match the structure in the image
				setGlucoseLevel(
					data.blood_sugar_level ? String(data.blood_sugar_level) : ""
				);
				setMeasurementType(data.jenis_pengukuran || "Sebelum Makan");
				setMeasurementTime(data.waktu_pengukuran || "");
				setNotes(data.notes || "");
			}
		} catch (error) {
			console.error("Error loading blood sugar data:", error);
			Alert.alert("Error", "Failed to load blood sugar data");
		} finally {
			// Add a small delay to ensure the UI has time to update
			setTimeout(() => {
				setIsLoading(false);
			}, 300);
		}
	};

	// Save blood sugar data
	const saveBloodSugarData = async () => {
		if (!auth.currentUser) {
			Alert.alert("Error", "You must be logged in to save data");
			return;
		}

		// Validate input data
		if (!glucoseLevel || isNaN(Number(glucoseLevel))) {
			Alert.alert("Missing Information", "Please enter a valid glucose level");
			return;
		}

		if (!measurementTime) {
			Alert.alert("Missing Information", "Please enter the measurement time");
			return;
		}

		// Regex to validate time format (HH:MM)
		const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
		if (!timeRegex.test(measurementTime)) {
			Alert.alert(
				"Invalid Time Format",
				"Please enter the time in HH:MM format (e.g., 07:30)"
			);
			return;
		}

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Use the activities collection structure shown in the image
			const bloodSugarRef = doc(db, `activities/${userId}/blood_sugar/${date}`);

			// Updated field names to match the structure in the image
			await setDoc(bloodSugarRef, {
				date: date,
				blood_sugar_level: Number(glucoseLevel),
				jenis_pengukuran: measurementType,
				waktu_pengukuran: measurementTime,
				notes: notes,
			});

			Alert.alert("Success", "Blood sugar data saved successfully");
			// Navigate to the Journal tab in BottomNavigation
			navigation.navigate("BottomNavigation", {
				screen: "Journal",
			});
		} catch (error) {
			console.error("Error saving blood sugar data:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			Alert.alert("Error", `Failed to save blood sugar data: ${errorMessage}`);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Clear previous data and set loading to true
		setGlucoseLevel("");
		setMeasurementType("Sebelum Makan");
		setMeasurementTime("");
		setNotes("");
		setIsLoading(true);

		// Load data for the selected date
		loadBloodSugarData();
	}, [date]);

	const status = getBloodSugarStatus();

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBack}>
					<Image source={IMAGES.leftarrow} style={styles.backIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Kadar Gula Darah</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
			>
				<View style={styles.dateContainer}>
					<Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
				</View>

				{isLoading ? (
					<BloodSugarSkeleton />
				) : (
					<>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Kadar Gula Darah (mg/dL)</Text>
							<TextInput
								style={styles.inputField}
								value={glucoseLevel}
								onChangeText={setGlucoseLevel}
								placeholder="Contoh: 100"
								keyboardType="number-pad"
							/>

							<Text style={styles.statusText}>
								Status:{" "}
								<Text style={{ color: status.color }}>{status.text}</Text>
							</Text>
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Jenis Pengukuran</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={measurementType}
									onValueChange={(itemValue) => setMeasurementType(itemValue)}
									style={styles.picker}
								>
									<Picker.Item label="Sebelum Makan" value="Sebelum Makan" />
									<Picker.Item label="Setelah Makan" value="Setelah Makan" />
									<Picker.Item label="Puasa" value="Puasa" />
									<Picker.Item label="Acak" value="Acak" />
								</Picker>
							</View>
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Waktu Pengukuran</Text>
							<TextInput
								style={styles.inputField}
								value={measurementTime}
								onChangeText={setMeasurementTime}
								placeholder="Format: HH:MM (contoh: 07:30)"
							/>
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Catatan</Text>
							<TextInput
								style={[styles.inputField, styles.textArea]}
								value={notes}
								onChangeText={setNotes}
								placeholder="Tambahkan catatan jika perlu..."
								multiline
								numberOfLines={4}
							/>
						</View>
					</>
				)}

				<TouchableOpacity
					style={[
						styles.saveButton,
						isLoading ? styles.saveButtonDisabled : null,
					]}
					onPress={saveBloodSugarData}
					disabled={isLoading}
				>
					<Text style={styles.saveButtonText}>
						{isLoading ? "Menyimpan..." : "Simpan"}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	backIcon: {
		width: 20,
		height: 20,
		tintColor: "#333",
	},
	headerTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: "#333",
	},
	dateContainer: {
		marginTop: 20,
		marginBottom: 10,
		padding: 15,
		backgroundColor: COLORS.primaryBlue + "15",
		borderRadius: 10,
		alignItems: "center",
	},
	dateText: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: COLORS.primaryBlue,
	},
	section: {
		marginTop: 20,
	},
	sectionTitle: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#333",
		marginBottom: 10,
	},
	inputField: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 10,
		padding: 12,
		...FONTS.fontRegular,
		fontSize: 15,
		color: "#333",
		backgroundColor: "#f9f9f9",
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 10,
		backgroundColor: "#f9f9f9",
		marginBottom: 15,
	},
	picker: {
		...FONTS.fontRegular,
		height: 50,
		color: "#333",
	},
	statusText: {
		...FONTS.fontMedium,
		fontSize: 15,
		marginTop: 10,
		color: "#333",
	},
	saveButton: {
		height: 55,
		backgroundColor: COLORS.primaryBlue,
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 25,
	},
	saveButtonDisabled: {
		backgroundColor: COLORS.primaryBlue + "80",
	},
	saveButtonText: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: COLORS.white,
	},
	skeletonSectionTitle: {
		width: "70%",
		height: 20,
		backgroundColor: "#E0E0E0",
		borderRadius: 4,
		marginBottom: 10,
	},
	skeletonInput: {
		height: 48,
		backgroundColor: "#E0E0E0",
		borderRadius: 10,
		marginBottom: 15,
	},
	skeletonStatus: {
		width: "50%",
		height: 20,
		backgroundColor: "#E0E0E0",
		borderRadius: 4,
		marginTop: 10,
	},
	skeletonPicker: {
		height: 50,
		backgroundColor: "#E0E0E0",
		borderRadius: 10,
		marginBottom: 15,
	},
	skeletonTextArea: {
		height: 100,
		backgroundColor: "#E0E0E0",
		borderRadius: 10,
	},
});

export default BloodSugarScreen;
