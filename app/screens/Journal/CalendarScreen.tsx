import React, { useState, useEffect } from "react";
import {
	SafeAreaView,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { FONTS, COLORS } from "../../constants/theme";
import { IMAGES } from "../../constants/Images";
import JournalCalendar from "../../components/JournalCalendar";

interface CalendarScreenProps {
	navigation: any;
	route: {
		params: {
			journalType: "activities" | "diet" | "stress" | "blood_sugar";
			title: string;
		};
	};
}

const CalendarScreen = ({ navigation, route }: CalendarScreenProps) => {
	const { journalType, title } = route.params;
	const theme = useTheme();
	const { colors } = theme;

	const [selectedDate, setSelectedDate] = useState<string>("");
	const [key, setKey] = useState<number>(0); // Key for forcing calendar refresh

	// Reset selected date when journal type changes
	useEffect(() => {
		setSelectedDate("");
		// Force calendar component to refresh when journal type changes
		setKey((prevKey) => prevKey + 1);
	}, [journalType]);

	// Navigate to Journal screen when calendar is closed
	const handleClose = () => {
		// Navigate back to BottomNavigation and specify the Journal tab
		navigation.navigate("BottomNavigation", {
			screen: "Journal",
		});
	};

	const handleSelectDate = (date: string) => {
		setSelectedDate(date);

		// Handle navigation to input screens
		setTimeout(() => {
			// Then navigate to the appropriate screen based on journal type
			switch (journalType) {
				case "activities":
					navigation.navigate("PhysicalActivityScreen", {
						date,
						journalType,
						title,
					});
					break;
				case "diet":
					navigation.navigate("DietScreen", { date, journalType, title });
					break;
				case "stress":
					navigation.navigate("StressScreen", { date, journalType, title });
					break;
				case "blood_sugar":
					navigation.navigate("BloodSugarScreen", { date, journalType, title });
					break;
				default:
					// Fallback in case of unexpected journal type
					console.warn(`Unknown journal type: ${journalType}`);
					navigation.navigate("BottomNavigation", {
						screen: "Journal",
					});
					break;
			}
		}, 100); // Small delay to ensure clean transition
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleClose}>
					<Image source={IMAGES.leftarrow} style={styles.backIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{title}</Text>
				<View style={{ width: 40 }} />
			</View>

			<JournalCalendar
				key={key}
				visible={true}
				onClose={handleClose}
				onSelectDate={handleSelectDate}
				journalType={journalType}
			/>
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
});

export default CalendarScreen;
