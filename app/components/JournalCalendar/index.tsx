import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	Modal,
	FlatList,
	Image,
	ActivityIndicator as RNActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { FONTS, COLORS, SIZES } from "../../constants/theme";
import { IMAGES } from "../../constants/Images";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

// Simple ActivityIndicator component
const ActivityIndicator = () => (
	<View style={styles.loadingContainer}>
		<RNActivityIndicator size="large" color={COLORS.primary} />
	</View>
);

interface JournalCalendarProps {
	visible: boolean;
	onClose: () => void;
	onSelectDate: (date: string) => void;
	journalType: "activities" | "diet" | "stress" | "blood_sugar";
}

interface DateWithData {
	date: string;
	hasData: boolean;
}

interface MarkedDates {
	[key: string]: {
		marked: boolean;
		dotColor: string;
		selected?: boolean;
		selectedColor?: string;
	};
}

interface CalendarItem {
	day?: number;
	dateString?: string;
	isToday?: boolean;
	isSelected?: boolean;
	hasData?: boolean;
	isEmpty: boolean;
}

const JournalCalendar = ({
	visible,
	onClose,
	onSelectDate,
	journalType,
}: JournalCalendarProps) => {
	const theme = useTheme();
	const { colors } = theme;

	const [selectedDate, setSelectedDate] = useState<string>(
		new Date().toISOString().split("T")[0]
	);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [markedDates, setMarkedDates] = useState<MarkedDates>({});
	const [isLoading, setIsLoading] = useState(false);

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	// Format date for API calls
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// Convert string date to Date object
	const stringToDate = (dateString: string): Date => {
		const [year, month, day] = dateString.split("-").map(Number);
		return new Date(year, month - 1, day);
	};

	// Generate calendar data
	const generateCalendarData = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		// Get first day of month
		const firstDayOfMonth = new Date(year, month, 1);
		const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

		// Get number of days in month
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		// Generate calendar data
		const calendarData: CalendarItem[] = [];

		// Add empty cells for days before first day of month
		for (let i = 0; i < firstDayOfWeek; i++) {
			calendarData.push({ isEmpty: true });
		}

		// Add days of month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			const dateString = formatDate(date);

			// Check if date has data from markedDates
			const hasData = markedDates[dateString]?.marked || false;

			// Check if it's the selected date
			const isSelected = selectedDate === dateString;

			// Check if it's today's date
			const isToday = formatDate(new Date()) === dateString;

			calendarData.push({
				day,
				dateString,
				isToday,
				isSelected,
				hasData,
				isEmpty: false,
			});
		}

		return calendarData;
	};

	// Fetch dates that have data
	const fetchDatesWithData = async () => {
		if (!auth.currentUser) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			const dates: string[] = [];

			// Use specific document structure based on journal type
			if (
				journalType === "diet" ||
				journalType === "blood_sugar" ||
				journalType === "stress"
			) {
				// For diet, blood_sugar, and stress, use the activities/${userId}/<journalType>/ structure
				const collectionPath = `activities/${userId}/${journalType}`;
				const collectionRef = collection(db, collectionPath);

				const querySnapshot = await getDocs(collectionRef);

				querySnapshot.forEach((doc) => {
					// The document ID is the date
					dates.push(doc.id);
				});
			} else {
				// For other journal types, use the structure ${journalType}/${userId}/${journalType}
				const collectionPath = `${journalType}/${userId}/${journalType}`;
				const collectionRef = collection(db, collectionPath);

				const querySnapshot = await getDocs(collectionRef);

				querySnapshot.forEach((doc) => {
					// The document ID is the date
					dates.push(doc.id);
				});
			}

			// Create marked dates object
			const marked: MarkedDates = {};

			// First mark all dates that have data
			dates.forEach((date) => {
				marked[date] = getMarkedDateStyle(journalType);
			});

			// Then ensure the selected date is also marked (this should override any existing style)
			if (selectedDate) {
				marked[selectedDate] = {
					...(dates.includes(selectedDate)
						? getMarkedDateStyle(journalType)
						: { marked: false, dotColor: COLORS.primary }),
					selected: true,
					selectedColor: COLORS.primary,
				};
			}

			setMarkedDates(marked);
		} catch (error) {
			console.error("Error fetching dates with data:", error);
			// Set empty marked dates to avoid displaying old data
			setMarkedDates({});
		} finally {
			// Make sure to set loading state to false even if there's an error
			setIsLoading(false);
		}
	};

	// Helper to get the appropriate style for each journal type
	const getMarkedDateStyle = (type: string) => {
		switch (type) {
			case "activities":
				return {
					marked: true,
					dotColor: "#4CAF50",
					selectedColor: "#4CAF50",
				};
			case "diet":
				return {
					marked: true,
					dotColor: "#FFA500",
					selectedColor: "#FFA500",
				};
			case "stress":
				return {
					marked: true,
					dotColor: "#F44336",
					selectedColor: "#F44336",
				};
			case "blood_sugar":
				return {
					marked: true,
					dotColor: "#2196F3",
					selectedColor: "#2196F3",
				};
			default:
				return {
					marked: true,
					dotColor: COLORS.primary,
					selectedColor: COLORS.primary,
				};
		}
	};

	// Handle date selection
	const handleDayPress = (item: CalendarItem) => {
		if (!item.dateString) return;

		const newSelectedDate = item.dateString;

		// Create a fresh copy of the existing marked dates
		const updatedMarkedDates = { ...markedDates };

		// Reset the previously selected date to its original style
		// If it had data, make sure it keeps the "has data" marking
		if (markedDates[selectedDate]) {
			// Get the dates with data to check if the previous selection had data
			const hasData = Object.keys(markedDates).includes(selectedDate);

			if (hasData) {
				// If the date had data, restore its data marking style
				updatedMarkedDates[selectedDate] = getMarkedDateStyle(journalType);
			} else {
				// If it was just a regular date, remove it from marked dates
				delete updatedMarkedDates[selectedDate];
			}
		}

		// Mark the new selected date
		updatedMarkedDates[newSelectedDate] = {
			...getMarkedDateStyle(journalType),
			selected: true,
		};

		// Update state with the new selection
		setSelectedDate(newSelectedDate);
		setMarkedDates(updatedMarkedDates);

		// Call the callback to navigate to the appropriate screen
		onSelectDate(newSelectedDate);

		// Close calendar modal
		if (onClose) {
			onClose();
		}
	};

	useEffect(() => {
		if (visible) {
			fetchDatesWithData();
		}
	}, [visible, journalType, currentMonth, selectedDate]);

	const handlePrevMonth = () => {
		const newMonth = new Date(currentMonth);
		newMonth.setMonth(newMonth.getMonth() - 1);
		setCurrentMonth(newMonth);
	};

	const handleNextMonth = () => {
		const newMonth = new Date(currentMonth);
		newMonth.setMonth(newMonth.getMonth() + 1);
		setCurrentMonth(newMonth);
	};

	const renderDay = ({ item }: { item: CalendarItem }) => {
		if (item.isEmpty) {
			return <View style={styles.emptyDay} />;
		}

		return (
			<TouchableOpacity
				style={[
					styles.dayContainer,
					item.hasData && styles.dayWithDataContainer,
					item.isToday && styles.todayContainer,
					item.isSelected && styles.selectedDayContainer,
				]}
				onPress={() => handleDayPress(item)}
				disabled={item.isEmpty}
			>
				<Text
					style={[
						styles.dayText,
						item.hasData && styles.dayWithDataText,
						item.isToday && styles.todayText,
						item.isSelected && styles.selectedDayText,
					]}
				>
					{item.day}
				</Text>
				{item.hasData && <View style={styles.dataIndicator} />}
			</TouchableOpacity>
		);
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={false}
			onRequestClose={onClose}
		>
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
			>
				<View style={styles.header}>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Image
							source={IMAGES.leftarrow}
							style={[styles.closeIcon, { tintColor: colors.text }]}
						/>
					</TouchableOpacity>
					<Text style={[styles.headerTitle, { color: colors.text }]}>
						Select Date
					</Text>
					<View style={styles.rightPlaceholder} />
				</View>

				<View style={styles.calendarHeader}>
					<TouchableOpacity onPress={handlePrevMonth}>
						<Image
							source={IMAGES.iconLeft}
							style={[styles.navIcon, { tintColor: colors.text }]}
						/>
					</TouchableOpacity>

					<Text style={[styles.monthYearText, { color: colors.text }]}>
						{`${
							monthNames[currentMonth.getMonth()]
						} ${currentMonth.getFullYear()}`}
					</Text>

					<TouchableOpacity onPress={handleNextMonth}>
						<Image
							source={IMAGES.iconRight}
							style={[styles.navIcon, { tintColor: colors.text }]}
						/>
					</TouchableOpacity>
				</View>

				<View style={styles.weekdaysContainer}>
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
						(day, index) => (
							<Text
								key={index}
								style={[styles.weekdayText, { color: colors.text }]}
							>
								{day}
							</Text>
						)
					)}
				</View>

				{isLoading ? (
					<ActivityIndicator />
				) : (
					<FlatList
						data={generateCalendarData()}
						renderItem={renderDay}
						keyExtractor={(item, index) => index.toString()}
						numColumns={7}
						contentContainerStyle={styles.calendarGrid}
					/>
				)}

				<View style={styles.legendContainer}>
					<View style={styles.legendItem}>
						<View style={styles.legendIndicator} />
						<Text style={[styles.legendText, { color: colors.text }]}>
							Tanggal
						</Text>
					</View>

					<View style={styles.legendItem}>
						<View
							style={[styles.legendIndicator, styles.dayWithDataContainer]}
						/>
						<Text style={[styles.legendText, { color: colors.text }]}>
							Pernah Terisi
						</Text>
					</View>

					<View style={styles.legendItem}>
						<View style={[styles.legendIndicator, styles.todayContainer]} />
						<Text style={[styles.legendText, { color: colors.text }]}>
							Hari Ini
						</Text>
					</View>

					<View style={styles.legendItem}>
						<View
							style={[styles.legendIndicator, styles.selectedDayContainer]}
						/>
						<Text style={[styles.legendText, { color: colors.text }]}>
							Terpilih
						</Text>
					</View>
				</View>
			</SafeAreaView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	headerTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
	},
	closeButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	closeIcon: {
		width: 20,
		height: 20,
	},
	rightPlaceholder: {
		width: 40,
	},
	calendarHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	navIcon: {
		width: 24,
		height: 24,
	},
	monthYearText: {
		...FONTS.fontSemiBold,
		fontSize: 18,
	},
	weekdaysContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 10,
		paddingHorizontal: 10,
	},
	weekdayText: {
		...FONTS.fontMedium,
		fontSize: 14,
		width: SIZES.width / 7 - 10,
		textAlign: "center",
		paddingVertical: 10,
	},
	calendarGrid: {},
	dayContainer: {
		width: SIZES.width / 7 - 10,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		margin: 5,
		borderRadius: 8,
		backgroundColor: "#f5f5f5",
	},
	emptyDay: {
		width: SIZES.width / 7 - 10,
		height: 50,
		margin: 5,
	},
	dayText: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: "#333",
	},
	todayContainer: {
		backgroundColor: "#E8F5E9",
		borderWidth: 1,
		borderColor: "#4CAF50",
		borderStyle: "dashed",
	},
	todayText: {
		color: "#4CAF50",
		fontWeight: "bold",
	},
	selectedDayContainer: {
		backgroundColor: COLORS.primaryBlue,
		borderWidth: 0,
	},
	selectedDayText: {
		color: "#fff",
		fontWeight: "bold",
	},
	dayWithDataContainer: {
		backgroundColor: "#E9F3FF",
		borderWidth: 1,
		borderColor: "#2196F3",
	},
	dayWithDataText: {
		color: "#2196F3",
	},
	dataIndicator: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: "#2196F3",
		position: "absolute",
		bottom: 8,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	legendContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		paddingVertical: 15,
		paddingHorizontal: 10,
		borderTopWidth: 1,
		borderTopColor: "#eee",
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		width: "48%",
		marginVertical: 5,
	},
	legendIndicator: {
		width: 20,
		height: 20,
		borderRadius: 4,
		marginRight: 8,
		backgroundColor: "#f5f5f5",
	},
	legendText: {
		...FONTS.fontMedium,
		fontSize: 14,
	},
});

export default JournalCalendar;
