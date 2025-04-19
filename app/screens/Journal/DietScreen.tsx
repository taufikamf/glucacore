import React from "react";
import {
	SafeAreaView,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS } from "../../constants/theme";
import { IMAGES } from "../../constants/Images";

interface DietScreenProps {
	navigation: any;
	route: {
		params: {
			mealType?: "pagi" | "selingan" | "siang" | "malam";
			date?: string;
		};
	};
}

const DietScreen = ({ navigation, route }: DietScreenProps) => {
	const theme = useTheme();
	const { colors } = theme;
	const { date = new Date().toISOString().split("T")[0], mealType } =
		route.params || {};

	// Check if a meal type was provided in navigation params
	// If so, navigate directly to the Diet form screen
	React.useEffect(() => {
		if (mealType) {
			// Navigate directly to Diet input form with the selected meal type
			navigation.replace("Diet", {
				date,
				mealType,
			});
		}
	}, [mealType, date]);

	// Navigate directly to Journal screen
	const handleBack = () => {
		// Navigate to the Journal tab in BottomNavigation
		navigation.navigate("BottomNavigation", {
			screen: "Journal",
		});
	};

	// Navigate to diet input screen
	const handleNavigateToDietInput = (selectedMealType: string) => {
		navigation.navigate("Diet", {
			date,
			mealType: selectedMealType,
		});
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBack}>
					<Image source={IMAGES.leftarrow} style={styles.backIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Diet Hari Ini</Text>
				<View style={{ width: 40 }} />
			</View>

			<View style={styles.container}>
				<Text style={styles.dateText}>
					{new Date(date).toLocaleDateString("id-ID", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</Text>

				<View style={styles.mealGrid}>
					<View style={styles.mealRow}>
						<TouchableOpacity
							style={styles.mealCard}
							onPress={() => handleNavigateToDietInput("pagi")}
						>
							<View style={styles.mealTitleContainer}>
								<Text style={styles.mealTitle}>PAGI</Text>
							</View>
							<View style={styles.mealImageContainer}>
								<Image
									source={IMAGES.pagi}
									style={styles.mealImage}
									resizeMode="contain"
								/>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.mealCard}
							onPress={() => handleNavigateToDietInput("selingan")}
						>
							<View style={styles.mealTitleContainer}>
								<Text style={styles.mealTitle}>SELINGAN</Text>
							</View>
							<View style={styles.mealImageContainer}>
								<Image
									source={IMAGES.selingan}
									style={styles.mealImage}
									resizeMode="contain"
								/>
							</View>
						</TouchableOpacity>
					</View>

					<View style={styles.mealRow}>
						<TouchableOpacity
							style={styles.mealCard}
							onPress={() => handleNavigateToDietInput("siang")}
						>
							<View style={styles.mealTitleContainer}>
								<Text style={styles.mealTitle}>SIANG</Text>
							</View>
							<View style={styles.mealImageContainer}>
								<Image
									source={IMAGES.siang}
									style={styles.mealImage}
									resizeMode="contain"
								/>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.mealCard}
							onPress={() => handleNavigateToDietInput("malam")}
						>
							<View style={styles.mealTitleContainer}>
								<Text style={styles.mealTitle}>MALAM</Text>
							</View>
							<View style={styles.mealImageContainer}>
								<Image
									source={IMAGES.malam}
									style={styles.mealImage}
									resizeMode="contain"
								/>
							</View>
						</TouchableOpacity>
					</View>
				</View>
			</View>
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
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#E6F0FD",
	},
	dateText: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: COLORS.primary,
		textAlign: "center",
	},
	mealGrid: {
		flex: 1,
		justifyContent: "center",
	},
	mealRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	mealCard: {
		width: "48%",
		aspectRatio: 1,
		borderRadius: 16,
		overflow: "hidden",
		backgroundColor: "white",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	mealTitleContainer: {
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "white",
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
		zIndex: 1,
	},
	mealTitle: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#333",
	},
	mealImageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
	},
	mealImage: {
		width: "100%",
		height: "100%",
	},
});

export default DietScreen;
