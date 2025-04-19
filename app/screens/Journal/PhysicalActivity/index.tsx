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
import { Checkbox } from "react-native-paper";

// Skeleton loading component for activity items
const ActivitySkeleton = () => {
	return (
		<>
			{[1, 2, 3, 4, 5, 6, 7].map((item) => (
				<View
					key={item}
					style={[styles.activityRow, item % 2 === 0 && styles.alternateRow]}
				>
					<View style={styles.skeletonLabel} />
					<View style={styles.skeletonCheckbox} />
				</View>
			))}
		</>
	);
};

const PhysicalActivityScreen = ({ navigation, route }: any) => {
	const theme = useTheme();
	const { colors } = theme;
	const {
		date,
		journalType = "activities",
		title = "Aktifitas Fisik",
	} = route.params || {
		date: new Date().toISOString().split("T")[0],
		journalType: "activities",
		title: "Aktifitas Fisik",
	};

	const [isLoading, setIsLoading] = useState(true);
	const [duration, setDuration] = useState("");

	// Activities checkbox states
	const [jogging, setJogging] = useState(false);
	const [lari, setLari] = useState(false);
	const [jalanSantai, setJalanSantai] = useState(false);
	const [yoga, setYoga] = useState(false);
	const [senam, setSenam] = useState(false);
	const [othersName, setOthersName] = useState("");
	const [othersValue, setOthersValue] = useState(false);

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

	// Load existing data
	const loadActivityData = async () => {
		if (!auth.currentUser) return;

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Use new document path structure
			const activityRef = doc(db, `activities/${userId}/activities/${date}`);
			const docSnap = await getDoc(activityRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				const activities = data.activities || {};

				// Set checkbox states
				setJogging(activities.jogging || false);
				setLari(activities.lari || false);
				setJalanSantai(activities.jalan_santai || false);
				setYoga(activities.yoga || false);
				setSenam(activities.senam || false);
				setOthersName(activities.others_name || "");
				setOthersValue(activities.others_value || false);

				// Set duration
				setDuration(activities.duration ? String(activities.duration) : "");
			}
		} catch (error) {
			console.error("Error loading activity data:", error);
			Alert.alert("Error", "Failed to load activity data");
		} finally {
			// Add a small delay to ensure the UI has time to update
			setTimeout(() => {
				setIsLoading(false);
			}, 300);
		}
	};

	// Save activity data
	const saveActivityData = async () => {
		if (!auth.currentUser) {
			Alert.alert("Error", "You must be logged in to save data");
			return;
		}

		// Validate at least one activity is selected
		if (
			!(
				jogging ||
				lari ||
				jalanSantai ||
				yoga ||
				senam ||
				(othersValue && othersName)
			)
		) {
			Alert.alert("Missing Information", "Please select at least one activity");
			return;
		}

		// Validate duration
		if (!duration) {
			Alert.alert("Missing Information", "Please enter activity duration");
			return;
		}

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Use new document path structure
			const activityRef = doc(db, `activities/${userId}/activities/${date}`);

			await setDoc(activityRef, {
				date,
				activities: {
					duration: Number(duration),
					jogging,
					lari,
					jalan_santai: jalanSantai,
					yoga,
					senam,
					others_name: othersName,
					others_value: othersValue && othersName ? true : false,
				},
			});

			Alert.alert("Success", "Activity data saved successfully");
			// Navigate to the Journal tab in BottomNavigation
			navigation.navigate("BottomNavigation", {
				screen: "Journal",
			});
		} catch (error) {
			console.error("Error saving activity data:", error);
			Alert.alert("Error", "Failed to save activity data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadActivityData();
	}, [date]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBack}>
					<Image source={IMAGES.leftarrow} style={styles.backIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Aktivitas Fisik</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
			>
				<View style={styles.dateContainer}>
					<Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Aktivitas Apa Kamu Hari ini</Text>

					{isLoading ? (
						<ActivitySkeleton />
					) : (
						<>
							<View style={styles.activityRow}>
								<Text style={styles.activityLabel}>1. Jogging</Text>
								<Checkbox
									status={jogging ? "checked" : "unchecked"}
									onPress={() => setJogging(!jogging)}
									color={COLORS.primaryBlue}
								/>
							</View>

							<View style={[styles.activityRow, styles.alternateRow]}>
								<Text style={styles.activityLabel}>2. Lari</Text>
								<Checkbox
									status={lari ? "checked" : "unchecked"}
									onPress={() => setLari(!lari)}
									color={COLORS.primaryBlue}
								/>
							</View>

							<View style={styles.activityRow}>
								<Text style={styles.activityLabel}>3. Jalan santai</Text>
								<Checkbox
									status={jalanSantai ? "checked" : "unchecked"}
									onPress={() => setJalanSantai(!jalanSantai)}
									color={COLORS.primaryBlue}
								/>
							</View>

							<View style={[styles.activityRow, styles.alternateRow]}>
								<Text style={styles.activityLabel}>4. Yoga</Text>
								<Checkbox
									status={yoga ? "checked" : "unchecked"}
									onPress={() => setYoga(!yoga)}
									color={COLORS.primaryBlue}
								/>
							</View>

							<View style={styles.activityRow}>
								<Text style={styles.activityLabel}>5. Senam</Text>
								<Checkbox
									status={senam ? "checked" : "unchecked"}
									onPress={() => setSenam(!senam)}
									color={COLORS.primaryBlue}
								/>
							</View>

							<View style={[styles.activityRow, styles.alternateRow]}>
								<View style={styles.othersContainer}>
									<Text style={styles.activityLabel}>
										6. Aktivitas Lainnya :{" "}
									</Text>
									<TextInput
										style={styles.othersInput}
										value={othersName}
										onChangeText={setOthersName}
										placeholder=""
									/>
								</View>
								<Checkbox
									status={othersValue ? "checked" : "unchecked"}
									onPress={() => setOthersValue(!othersValue)}
									color={COLORS.primaryBlue}
								/>
							</View>

							<View style={styles.activityRow}>
								<View style={styles.othersContainer}>
									<Text style={styles.activityLabel}>7. Durasi : </Text>
									<TextInput
										style={styles.durationInput}
										value={duration}
										onChangeText={setDuration}
										keyboardType="number-pad"
										placeholder=""
									/>
									<Text style={styles.activityLabel}> menit</Text>
								</View>
								<Checkbox
									status={duration ? "checked" : "unchecked"}
									onPress={() => {}}
									color={COLORS.primaryBlue}
								/>
							</View>
						</>
					)}
				</View>

				<TouchableOpacity
					style={[
						styles.saveButton,
						isLoading ? styles.saveButtonDisabled : null,
					]}
					onPress={saveActivityData}
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
		marginBottom: 20,
	},
	sectionTitle: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#333",
		marginBottom: 15,
	},
	activityRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 15,
		paddingHorizontal: 10,
	},
	alternateRow: {
		backgroundColor: "#E9F0FB",
	},
	activityLabel: {
		...FONTS.fontMedium,
		fontSize: 15,
		color: "#333",
	},
	othersContainer: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	othersInput: {
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		minWidth: 120,
		paddingVertical: 0,
		...FONTS.fontRegular,
		fontSize: 15,
	},
	durationInput: {
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		width: 60,
		paddingVertical: 0,
		...FONTS.fontRegular,
		fontSize: 15,
		textAlign: "center",
	},
	saveButton: {
		height: 55,
		backgroundColor: COLORS.primaryBlue,
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 20,
	},
	saveButtonDisabled: {
		backgroundColor: COLORS.primaryBlue + "80",
	},
	saveButtonText: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: COLORS.white,
	},
	skeletonLabel: {
		width: "70%",
		height: 20,
		backgroundColor: "#E0E0E0",
		borderRadius: 4,
	},
	skeletonCheckbox: {
		width: 24,
		height: 24,
		borderRadius: 4,
		backgroundColor: "#E0E0E0",
	},
});

export default PhysicalActivityScreen;
