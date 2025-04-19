import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { COLORS, FONTS } from "../../constants/theme";
import { IMAGES } from "../../constants/Images";

interface FoodItem {
	name: string;
	amount: string; // This is for display purposes (e.g. "100g")
}

interface DietBreakdownProps {
	title: string;
	mealType: "pagi" | "selingan" | "siang" | "malam";
	carbSource?: FoodItem[];
	proteinAnimalSource?: FoodItem[];
	proteinPlantSource?: FoodItem[];
	vegetables?: FoodItem[];
	fats?: FoodItem[];
	totalGram?: number;
	onPress?: () => void;
	editable?: boolean;
}

const DietBreakdown: React.FC<DietBreakdownProps> = ({
	title,
	mealType,
	carbSource = [],
	proteinAnimalSource = [],
	proteinPlantSource = [],
	vegetables = [],
	fats = [],
	totalGram = 0,
	onPress,
	editable = true,
}) => {
	// Function to render food items with arrow indicators
	const renderFoodSection = (title: string, items: FoodItem[]) => {
		// Don't render empty sections
		if (items.length === 0) return null;

		return (
			<View style={styles.foodSection}>
				<Text style={styles.sectionTitle}>{title}</Text>
				{items.map((item, index) => (
					<View key={index} style={styles.foodItem}>
						<Text style={styles.foodName}>
							{item.name} {item.amount}
						</Text>
						<TouchableOpacity disabled={!editable}>
							<Image source={IMAGES.rightarrow} style={styles.arrowIcon} />
						</TouchableOpacity>
					</View>
				))}
			</View>
		);
	};

	// Render appropriate sections based on meal type
	const renderContent = () => {
		if (mealType === "selingan") {
			// For selingan, we only show fruits and milk
			return (
				<>
					{renderFoodSection("Buah-buahan", carbSource)}
					{renderFoodSection("Susu", proteinAnimalSource)}
				</>
			);
		} else {
			// For regular meals (pagi, siang, malam)
			return (
				<>
					{renderFoodSection("Sumber Karbohidrat", carbSource)}
					{renderFoodSection("Sumber Protein Hewani", proteinAnimalSource)}
					{renderFoodSection("Sumber Protein Nabati", proteinPlantSource)}
					{renderFoodSection("Sayur-Sayuran", vegetables)}
					{renderFoodSection("Minyak", fats)}
				</>
			);
		}
	};

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={onPress}
			disabled={!onPress}
		>
			<View style={styles.headerRow}>
				<Text style={styles.title}>{title}</Text>
				{totalGram > 0 && <Text style={styles.totalGram}>{totalGram}g</Text>}
			</View>

			{renderContent()}

			{editable && (
				<View style={styles.editBtnContainer}>
					<TouchableOpacity style={styles.editButton} onPress={onPress}>
						<Text style={styles.editBtnText}>Edit</Text>
					</TouchableOpacity>
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#E9F3FF",
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
	},
	title: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: COLORS.primary,
		marginBottom: 12,
		textAlign: "center",
	},
	foodSection: {
		marginBottom: 10,
	},
	sectionTitle: {
		...FONTS.fontMedium,
		fontSize: 15,
		color: "#333",
		marginBottom: 6,
	},
	foodItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 10,
		backgroundColor: "white",
		borderRadius: 8,
		marginBottom: 6,
	},
	foodName: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#333",
	},
	arrowIcon: {
		width: 16,
		height: 16,
		tintColor: "#666",
	},
	editBtnContainer: {
		alignItems: "center",
		marginTop: 10,
	},
	editButton: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 20,
	},
	editBtnText: {
		...FONTS.fontMedium,
		fontSize: 14,
		color: "white",
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	totalGram: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#666",
	},
});

export default DietBreakdown;
