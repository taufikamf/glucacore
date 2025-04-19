import React, { useState, useEffect } from "react";
import {
	SafeAreaView,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { IMAGES } from "../../constants/Images";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { auth, db } from "../../config/firebase";
import {
	doc,
	getDoc,
	collection,
	query,
	where,
	getDocs,
} from "firebase/firestore";
import DietBreakdown from "../../components/DietBreakdown";

// FoodItem for use in diet data
interface FoodItem {
	name: string;
	gram: number;
}

// JournalFoodItem for compatibility with DietBreakdown component
interface JournalFoodItem {
	name: string;
	amount: string;
}

// Updated DietData interface to match the structure in screenshot
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

// Interface for the data format needed by the DietBreakdown component
interface JournalDietData {
	mealType: string;
	date: string;
	carbSource: JournalFoodItem[];
	proteinAnimalSource: JournalFoodItem[];
	proteinPlantSource: JournalFoodItem[];
	vegetables: JournalFoodItem[];
	fats: JournalFoodItem[];
	totalGram: number;
}

// Define meal type keys to fix TypeScript indexing
type MealType = "pagi" | "selingan" | "siang" | "malam";

const JournalScreen = ({ navigation }: any) => {
	const theme = useTheme();
	const { colors } = theme;
	const [todayDate] = useState(new Date().toISOString().split("T")[0]);
	const [isLoading, setIsLoading] = useState(true);
	const [dietData, setDietData] = useState<{
		[key in MealType]: JournalDietData | null;
	}>({
		pagi: null,
		selingan: null,
		siang: null,
		malam: null,
	});

	const journalOptions = [
		{
			id: "1",
			title: "Aktifitas Fisik",
			description: "Catat aktivitas fisik harian Anda",
			icon: IMAGES.activity,
			journalType: "activities",
			backgroundColor: "#E9F3FF",
		},
		{
			id: "2",
			title: "Diet",
			description: "Pantau asupan makanan harian Anda",
			icon: IMAGES.diet,
			journalType: "diet",
			backgroundColor: "#E9F3FF",
		},
		{
			id: "3",
			title: "Stress",
			description: "Ukur tingkat stress Anda",
			icon: IMAGES.stress,
			journalType: "stress",
			backgroundColor: "#E9F3FF",
		},
		{
			id: "4",
			title: "Kadar Gula Darah",
			description: "Catat kadar gula darah Anda",
			icon: IMAGES.bloodSugar,
			journalType: "blood_sugar",
			backgroundColor: "#E9F3FF",
		},
	];

	const handleNavigation = (journalType: string, title: string) => {
		navigation.navigate("CalendarScreen", {
			journalType,
			title,
		});
	};

	// Navigate directly to input screen for today
	const handleNavigateToInputForToday = (
		journalType: string,
		date = todayDate
	) => {
		switch (journalType) {
			case "activities":
				navigation.navigate("PhysicalActivityScreen", { date });
				break;
			case "diet":
				// For diet, navigate to the DietScreen which shows meal type options
				navigation.navigate("DietScreen", { date });
				break;
			case "stress":
				navigation.navigate("StressScreen", { date });
				break;
			case "blood_sugar":
				navigation.navigate("BloodSugarScreen", { date });
				break;
			default:
				console.warn("Unknown journal type:", journalType);
		}
	};

	// Navigate to diet input for a specific meal type
	const handleEditDiet = (mealType: MealType) => {
		// Navigate directly to Diet form, bypassing the meal type selection screen
		navigation.navigate("Diet", {
			date: todayDate,
			mealType: mealType,
		});
	};

	// Fetch diet data for today
	const fetchTodayDietData = async () => {
		if (!auth.currentUser) return;

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Using the new Firestore path based on the screenshot
			const dietRef = doc(db, `activities/${userId}/diet/${todayDate}`);
			const docSnap = await getDoc(dietRef);

			const dietDataMap = {
				pagi: null,
				selingan: null,
				siang: null,
				malam: null,
			} as { [key in MealType]: JournalDietData | null };

			if (docSnap.exists()) {
				const data = docSnap.data() as DietData;

				// Map the data from new structure to our component's format
				const mealTypes: MealType[] = ["pagi", "selingan", "siang", "malam"];

				for (const mealType of mealTypes) {
					if (data[mealType as keyof DietData]) {
						// Convert Firestore data to our component format
						if (mealType === "selingan") {
							const selinganData = data.selingan;
							if (selinganData) {
								dietDataMap[mealType] = {
									mealType,
									date: data.date,
									// Include total gram if available
									totalGram: selinganData.total_gram || 0,
									// For selingan, we only have fruits and milk
									carbSource: [
										{
											name: selinganData.buah_buahan.name,
											amount: `${selinganData.buah_buahan.gram}g`,
										},
									],
									proteinAnimalSource: [
										{
											name: selinganData.susu.name,
											amount: `${selinganData.susu.gram}g`,
										},
									],
									proteinPlantSource: [],
									vegetables: [],
									fats: [],
								};
							}
						} else {
							// For regular meals (pagi, siang, malam)
							const mealData = data[mealType as "pagi" | "siang" | "malam"];
							if (mealData) {
								dietDataMap[mealType] = {
									mealType,
									date: data.date,
									// Include total gram if available
									totalGram: mealData.total_gram || 0,
									carbSource: [
										{
											name: mealData.karbohidrat.name,
											amount: `${mealData.karbohidrat.gram}g`,
										},
									],
									proteinAnimalSource: [
										{
											name: mealData.protein_hewani.name,
											amount: `${mealData.protein_hewani.gram}g`,
										},
									],
									proteinPlantSource: [
										{
											name: mealData.protein_nabati.name,
											amount: `${mealData.protein_nabati.gram}g`,
										},
									],
									vegetables: [
										{
											name: mealData.sayuran.name,
											amount: `${mealData.sayuran.gram}g`,
										},
									],
									fats: [
										{
											name: mealData.minyak.name,
											amount: `${mealData.minyak.gram}g`,
										},
									],
								};
							}
						}
					}
				}
			}

			setDietData(dietDataMap);
		} catch (error) {
			console.error("Error fetching diet data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Format meal title
	const getMealTypeTitle = (mealType: string): string => {
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

	// Load diet data when component mounts
	useEffect(() => {
		fetchTodayDietData();

		// Set up focus listener to refresh data when screen is focused
		const unsubscribe = navigation.addListener("focus", () => {
			fetchTodayDietData();
		});

		return unsubscribe;
	}, []);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={GlobalStyleSheet.container}>
				<Text style={styles.pageTitle}>Jurnal Harian</Text>
				<Text style={styles.pageSubtitle}>
					Pantau kondisi kesehatan Anda sehari-hari
				</Text>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 80 }}
				>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Kategori Jurnal</Text>
						{journalOptions.map((item) => (
							<TouchableOpacity
								key={item.id}
								style={[
									styles.journalCard,
									{ backgroundColor: item.backgroundColor },
								]}
								onPress={() => handleNavigation(item.journalType, item.title)}
							>
								<Image
									source={item.icon}
									style={styles.journalIcon}
									resizeMode="contain"
								/>
								<View style={styles.journalContent}>
									<Text style={styles.journalTitle}>{item.title}</Text>
								</View>
							</TouchableOpacity>
						))}
					</View>

					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Diet Hari Ini</Text>
							<TouchableOpacity
								onPress={() => handleNavigateToInputForToday("diet")}
							>
								<Text style={styles.seeAllText}>Tambah Data +</Text>
							</TouchableOpacity>
						</View>

						{isLoading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={COLORS.primaryBlue} />
								<Text style={styles.loadingText}>Memuat data diet...</Text>
							</View>
						) : (
							<View style={styles.dietBreakdownContainer}>
								{(Object.keys(dietData) as MealType[]).map((mealType) => {
									const data = dietData[mealType];

									// Skip if no data for this meal type
									if (!data) {
										return (
											<TouchableOpacity
												key={mealType}
												style={styles.addMealButton}
												onPress={() => handleEditDiet(mealType)}
											>
												<Text style={styles.addMealTitle}>
													{getMealTypeTitle(mealType)}
												</Text>
												<Text style={styles.addMealText}>
													Tambahkan data makanan
												</Text>
											</TouchableOpacity>
										);
									}

									// Display the diet breakdown
									return (
										<DietBreakdown
											key={mealType}
											title={getMealTypeTitle(mealType)}
											mealType={mealType}
											carbSource={data.carbSource || []}
											proteinAnimalSource={data.proteinAnimalSource || []}
											proteinPlantSource={data.proteinPlantSource || []}
											vegetables={data.vegetables || []}
											fats={data.fats || []}
											totalGram={data.totalGram}
											onPress={() => handleEditDiet(mealType)}
										/>
									);
								})}
							</View>
						)}
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	pageTitle: {
		...FONTS.fontSemiBold,
		fontSize: 24,
		marginBottom: 5,
		color: "#333",
	},
	pageSubtitle: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#666",
		marginBottom: 20,
	},
	section: {
		marginBottom: 25,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	sectionTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: "#333",
		marginBottom: 15,
	},
	seeAllText: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: COLORS.primaryBlue,
	},
	journalCard: {
		flexDirection: "row",
		padding: 15,
		borderRadius: 12,
		marginBottom: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	journalIcon: {
		width: 100,
		height: 100,
	},
	journalContent: {
		flex: 1,
		justifyContent: "center",
	},
	journalTitle: {
		...FONTS.fontSemiBold,
		fontSize: 24,
		color: "#333",
		marginBottom: 5,
	},
	journalDescription: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#666",
	},
	loadingContainer: {
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		...FONTS.fontRegular,
		marginTop: 10,
		color: "#666",
	},
	dietBreakdownContainer: {
		marginTop: 5,
	},
	addMealButton: {
		backgroundColor: "#F8F8F8",
		borderRadius: 12,
		padding: 15,
		marginBottom: 15,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderStyle: "dashed",
	},
	addMealTitle: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#333",
		marginBottom: 5,
	},
	addMealText: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#666",
	},
});

export default JournalScreen;
