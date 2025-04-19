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
import DropdownSelect from "../../../components/DropdownSelect";
import {
	karbohidratOptions,
	proteinHewaniOptions,
	proteinNabatiOptions,
	sayuranOptions,
	minyakOptions,
	buahBuahanOptions,
	susuOptions,
	FoodOption,
} from "../../../constants/FoodOptions";

// Skeleton loading component for diet form
const DietSkeleton = () => {
	return (
		<>
			<View style={styles.skeletonSection} />
			<View style={styles.skeletonSection} />
			<View style={styles.skeletonSection} />
			<View style={styles.skeletonSection} />
			<View style={styles.skeletonSection} />
			<View style={styles.skeletonInput} />
		</>
	);
};

// Food item for each category
interface FoodItem {
	name: string;
	gram: number;
}

// Updated to match the Firestore structure from the screenshot
interface DietData {
	date: string;
	pagi?: {
		karbohidrat: FoodItem;
		protein_hewani: FoodItem;
		protein_nabati: FoodItem;
		sayuran: FoodItem;
		minyak: FoodItem;
		total_gram: number;
	};
	selingan?: {
		buah_buahan: FoodItem;
		susu: FoodItem;
		total_gram: number;
	};
	siang?: {
		karbohidrat: FoodItem;
		protein_hewani: FoodItem;
		protein_nabati: FoodItem;
		sayuran: FoodItem;
		minyak: FoodItem;
		total_gram: number;
	};
	malam?: {
		karbohidrat: FoodItem;
		protein_hewani: FoodItem;
		protein_nabati: FoodItem;
		sayuran: FoodItem;
		minyak: FoodItem;
		total_gram: number;
	};
	createdAt: string;
}

const DietScreen = ({ navigation, route }: any) => {
	const theme = useTheme();
	const { colors } = theme;
	const {
		date = new Date().toISOString().split("T")[0],
		mealType: initialMealType,
	} = route.params || {};

	const [isLoading, setIsLoading] = useState(true);
	const [showMealTypeSelection, setShowMealTypeSelection] = useState(
		!initialMealType
	);
	const [mealType, setMealType] = useState(initialMealType || "");
	const [notes, setNotes] = useState("");

	// Updated food item states to match the new structure
	// For regular meals (pagi, siang, malam)
	const [karbohidrat, setKarbohidrat] = useState<FoodItem>({
		name: "",
		gram: 0,
	});
	const [proteinHewani, setProteinHewani] = useState<FoodItem>({
		name: "",
		gram: 0,
	});
	const [proteinNabati, setProteinNabati] = useState<FoodItem>({
		name: "",
		gram: 0,
	});
	const [sayuran, setSayuran] = useState<FoodItem>({ name: "", gram: 0 });
	const [minyak, setMinyak] = useState<FoodItem>({ name: "", gram: 0 });

	// For selingan
	const [buahBuahan, setBuahBuahan] = useState<FoodItem>({ name: "", gram: 0 });
	const [susu, setSusu] = useState<FoodItem>({ name: "", gram: 0 });

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

	// Handle meal type selection
	const handleSelectMealType = (selectedMealType: string) => {
		setMealType(selectedMealType);
		setShowMealTypeSelection(false);
		loadDietData(selectedMealType);
	};

	// Load existing diet data
	const loadDietData = async (selectedMealType = mealType) => {
		if (!auth.currentUser || !selectedMealType) return;

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Use new document path structure based on the screenshot
			const dietRef = doc(db, `activities/${userId}/diet/${date}`);
			const docSnap = await getDoc(dietRef);

			if (docSnap.exists()) {
				const data = docSnap.data() as DietData;

				// Check if data for the selected meal type exists
				if (selectedMealType === "selingan" && data.selingan) {
					// Set selingan-specific food items
					setBuahBuahan(data.selingan.buah_buahan || { name: "", gram: 0 });
					setSusu(data.selingan.susu || { name: "", gram: 0 });
				} else {
					// For regular meals (pagi, siang, malam)
					const mealData = data[selectedMealType as "pagi" | "siang" | "malam"];
					if (mealData) {
						setKarbohidrat(mealData.karbohidrat || { name: "", gram: 0 });
						setProteinHewani(mealData.protein_hewani || { name: "", gram: 0 });
						setProteinNabati(mealData.protein_nabati || { name: "", gram: 0 });
						setSayuran(mealData.sayuran || { name: "", gram: 0 });
						setMinyak(mealData.minyak || { name: "", gram: 0 });
					} else {
						// Reset form if no data exists for this meal type
						resetFormFields(selectedMealType);
					}
				}
			} else {
				// Reset form if no data exists at all
				resetFormFields(selectedMealType);
			}
		} catch (error) {
			console.error("Error loading diet data:", error);
			Alert.alert("Error", "Failed to load diet data");
		} finally {
			// Add a small delay to ensure the UI has time to update
			setTimeout(() => {
				setIsLoading(false);
			}, 300);
		}
	};

	// Reset form fields based on meal type
	const resetFormFields = (mealType: string) => {
		if (mealType === "selingan") {
			setBuahBuahan({ name: "", gram: 0 });
			setSusu({ name: "", gram: 0 });
		} else {
			setKarbohidrat({ name: "", gram: 0 });
			setProteinHewani({ name: "", gram: 0 });
			setProteinNabati({ name: "", gram: 0 });
			setSayuran({ name: "", gram: 0 });
			setMinyak({ name: "", gram: 0 });
		}
	};

	// Calculate total gram for regular meals
	const calculateRegularMealTotal = () => {
		let total = 0;

		if (karbohidrat.gram) total += karbohidrat.gram;
		if (proteinHewani.gram) total += proteinHewani.gram;
		if (proteinNabati.gram) total += proteinNabati.gram;
		if (sayuran.gram) total += sayuran.gram;
		if (minyak.gram) total += minyak.gram;

		return total;
	};

	// Calculate total gram for selingan
	const calculateSelinganTotal = () => {
		let total = 0;

		if (buahBuahan.gram) total += buahBuahan.gram;
		if (susu.gram) total += susu.gram;

		return total;
	};

	// Get total gram based on meal type
	const getTotalGram = () => {
		if (mealType === "selingan") {
			return calculateSelinganTotal();
		} else {
			return calculateRegularMealTotal();
		}
	};

	// Render UI for selingan (different UI from regular meals)
	const renderSelinganForm = () => {
		return (
			<>
				<View style={styles.foodCategory}>
					<DropdownSelect
						label="Buah-buahan"
						options={buahBuahanOptions}
						value={buahBuahan}
						onSelect={(option) => setBuahBuahan(option)}
						placeholder="Pilih buah-buahan..."
					/>
				</View>

				<View style={styles.foodCategory}>
					<DropdownSelect
						label="Susu"
						options={susuOptions}
						value={susu}
						onSelect={(option) => setSusu(option)}
						placeholder="Pilih jenis susu..."
					/>
				</View>

				<View style={styles.totalContainer}>
					<Text style={styles.totalLabel}>Total Kalori:</Text>
					<Text style={styles.totalValue}>{calculateSelinganTotal()} gram</Text>
				</View>
			</>
		);
	};

	// Render UI for regular meals (pagi, siang, malam)
	const renderRegularMealForm = () => {
		return (
			<>
				<View style={styles.foodCategory}>
					<DropdownSelect
						label="Sumber Karbohidrat"
						options={karbohidratOptions}
						value={karbohidrat}
						onSelect={(option) => setKarbohidrat(option)}
						placeholder="Pilih sumber karbohidrat..."
					/>
				</View>

				<View style={styles.foodCategory}>
					<DropdownSelect
						label="Sumber Protein Hewani"
						options={proteinHewaniOptions}
						value={proteinHewani}
						onSelect={(option) => setProteinHewani(option)}
						placeholder="Pilih sumber protein hewani..."
					/>
				</View>

				<View style={styles.foodCategory}>
					<DropdownSelect
						label="Sumber Protein Nabati"
						options={proteinNabatiOptions}
						value={proteinNabati}
						onSelect={(option) => setProteinNabati(option)}
						placeholder="Pilih sumber protein nabati..."
					/>
				</View>

				<View style={styles.foodCategory}>
					<DropdownSelect
						label="Sayur-Sayuran"
						options={sayuranOptions}
						value={sayuran}
						onSelect={(option) => setSayuran(option)}
						placeholder="Pilih jenis sayuran..."
					/>
				</View>

				<View style={styles.foodCategory}>
					<DropdownSelect
						label="Minyak"
						options={minyakOptions}
						value={minyak}
						onSelect={(option) => setMinyak(option)}
						placeholder="Pilih jenis minyak..."
					/>
				</View>

				<View style={styles.totalContainer}>
					<Text style={styles.totalLabel}>Total Kalori:</Text>
					<Text style={styles.totalValue}>
						{calculateRegularMealTotal()} gram
					</Text>
				</View>
			</>
		);
	};

	// Save diet data
	const saveDietData = async () => {
		if (!auth.currentUser) {
			Alert.alert("Error", "You must be logged in to save data");
			return;
		}

		if (!mealType) {
			Alert.alert("Missing Information", "Please select a meal type");
			return;
		}

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			const dietRef = doc(db, `activities/${userId}/diet/${date}`);

			// First, get existing data to merge with new data
			const docSnap = await getDoc(dietRef);
			const existingData = docSnap.exists()
				? (docSnap.data() as DietData)
				: { date };

			// Prepare the data to save based on meal type
			let newData: any = {
				...existingData,
				createdAt: new Date().toISOString(),
			};

			if (mealType === "selingan") {
				// Validate selingan data
				if (!buahBuahan.name || !susu.name) {
					Alert.alert(
						"Missing Information",
						"Please select both fruit and milk items"
					);
					setIsLoading(false);
					return;
				}

				newData.selingan = {
					buah_buahan: buahBuahan,
					susu: susu,
					total_gram: calculateSelinganTotal(),
				};
			} else {
				// Validate regular meal data
				if (
					!karbohidrat.name ||
					!proteinHewani.name ||
					!proteinNabati.name ||
					!sayuran.name ||
					!minyak.name
				) {
					Alert.alert("Missing Information", "Please select all food items");
					setIsLoading(false);
					return;
				}

				newData[mealType] = {
					karbohidrat: karbohidrat,
					protein_hewani: proteinHewani,
					protein_nabati: proteinNabati,
					sayuran: sayuran,
					minyak: minyak,
					total_gram: calculateRegularMealTotal(),
				};
			}

			// Save data
			await setDoc(dietRef, newData, { merge: true });

			Alert.alert("Success", "Diet data saved successfully");
			// Navigate to the Journal tab in BottomNavigation
			navigation.navigate("BottomNavigation", {
				screen: "Journal",
			});
		} catch (error) {
			console.error("Error saving diet data:", error);
			Alert.alert("Error", "Failed to save diet data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// If a meal type was passed in route params, load that data immediately
		if (initialMealType) {
			loadDietData(initialMealType);
		} else {
			// Otherwise, show meal type selection and reset loading
			setShowMealTypeSelection(true);
			setIsLoading(false);
		}
	}, [date, initialMealType]);

	// Get meal type display name
	const getMealTypeDisplayName = () => {
		switch (mealType) {
			case "pagi":
				return "Makan Pagi";
			case "selingan":
				return "Selingan";
			case "siang":
				return "Makan Siang";
			case "malam":
				return "Makan Malam";
			default:
				return "Diet";
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBack}>
					<Image source={IMAGES.leftarrow} style={styles.backIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>
					{showMealTypeSelection ? "Diet" : getMealTypeDisplayName()}
				</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
			>
				<View style={styles.dateContainer}>
					<Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
				</View>

				{showMealTypeSelection ? (
					<View style={styles.mealTypeSelectionContainer}>
						<Text style={styles.sectionTitle}>Pilih Waktu Makan</Text>

						<TouchableOpacity
							style={styles.mealTypeCard}
							onPress={() => handleSelectMealType("pagi")}
						>
							<View style={styles.mealTypeIconContainer}>
								<Image
									source={IMAGES.diet}
									style={styles.mealTypeIcon}
									resizeMode="contain"
								/>
							</View>
							<View style={styles.mealTypeContent}>
								<Text style={styles.mealTypeTitle}>Makan Pagi</Text>
								<Text style={styles.mealTypeDescription}>
									Catat sarapan atau makanan pertama di pagi hari
								</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.mealTypeCard}
							onPress={() => handleSelectMealType("selingan")}
						>
							<View style={styles.mealTypeIconContainer}>
								<Image
									source={IMAGES.diet}
									style={styles.mealTypeIcon}
									resizeMode="contain"
								/>
							</View>
							<View style={styles.mealTypeContent}>
								<Text style={styles.mealTypeTitle}>Selingan</Text>
								<Text style={styles.mealTypeDescription}>
									Catat camilan di antara waktu makan utama
								</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.mealTypeCard}
							onPress={() => handleSelectMealType("siang")}
						>
							<View style={styles.mealTypeIconContainer}>
								<Image
									source={IMAGES.diet}
									style={styles.mealTypeIcon}
									resizeMode="contain"
								/>
							</View>
							<View style={styles.mealTypeContent}>
								<Text style={styles.mealTypeTitle}>Makan Siang</Text>
								<Text style={styles.mealTypeDescription}>
									Catat makanan untuk makan siang
								</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.mealTypeCard}
							onPress={() => handleSelectMealType("malam")}
						>
							<View style={styles.mealTypeIconContainer}>
								<Image
									source={IMAGES.diet}
									style={styles.mealTypeIcon}
									resizeMode="contain"
								/>
							</View>
							<View style={styles.mealTypeContent}>
								<Text style={styles.mealTypeTitle}>Makan Malam</Text>
								<Text style={styles.mealTypeDescription}>
									Catat makanan untuk makan malam
								</Text>
							</View>
						</TouchableOpacity>
					</View>
				) : isLoading ? (
					<DietSkeleton />
				) : (
					<>
						<View style={styles.formContainer}>
							{mealType === "selingan"
								? renderSelinganForm()
								: renderRegularMealForm()}
						</View>

						<TouchableOpacity
							style={[
								styles.saveButton,
								isLoading ? styles.saveButtonDisabled : null,
							]}
							onPress={saveDietData}
							disabled={isLoading}
						>
							<Text style={styles.saveButtonText}>
								{isLoading ? "Menyimpan..." : "Simpan"}
							</Text>
						</TouchableOpacity>
					</>
				)}
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
	formContainer: {
		marginTop: 10,
	},
	mealTypeSelectionContainer: {
		marginTop: 20,
	},
	mealTypeCard: {
		flexDirection: "row",
		backgroundColor: "#E9F3FF",
		borderRadius: 12,
		padding: 15,
		marginBottom: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	mealTypeIconContainer: {
		width: 70,
		height: 70,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 35,
		marginRight: 15,
	},
	mealTypeIcon: {
		width: 40,
		height: 40,
		tintColor: COLORS.primaryBlue,
	},
	mealTypeContent: {
		flex: 1,
		justifyContent: "center",
	},
	mealTypeTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: "#333",
		marginBottom: 4,
	},
	mealTypeDescription: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#666",
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
	foodCategory: {
		marginBottom: 15,
		backgroundColor: "#F8F8F8",
		borderRadius: 10,
		padding: 12,
	},
	categoryTitle: {
		...FONTS.fontSemiBold,
		fontSize: 15,
		color: "#333",
		marginBottom: 8,
	},
	foodItemInputRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	nameInput: {
		flex: 2,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 10,
		marginRight: 8,
		backgroundColor: "#fff",
		...FONTS.fontRegular,
		fontSize: 14,
	},
	amountInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 10,
		marginRight: 8,
		backgroundColor: "#fff",
		...FONTS.fontRegular,
		fontSize: 14,
	},
	removeButton: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: "#f0f0f0",
		justifyContent: "center",
		alignItems: "center",
	},
	removeButtonText: {
		fontSize: 18,
		color: "#666",
		fontWeight: "bold",
	},
	addButton: {
		marginTop: 5,
		padding: 8,
		borderRadius: 8,
		backgroundColor: "#E9F0FB",
		alignItems: "center",
	},
	addButtonText: {
		...FONTS.fontMedium,
		fontSize: 14,
		color: COLORS.primaryBlue,
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
	skeletonSection: {
		height: 100,
		backgroundColor: "#E0E0E0",
		borderRadius: 10,
		marginBottom: 15,
	},
	skeletonInput: {
		height: 100,
		backgroundColor: "#E0E0E0",
		borderRadius: 10,
		marginTop: 20,
	},
	totalContainer: {
		marginTop: 16,
		padding: 16,
		backgroundColor: COLORS.primaryBlue + "15",
		borderRadius: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	totalLabel: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#333",
	},
	totalValue: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: COLORS.primaryBlue,
	},
});

export default DietScreen;
