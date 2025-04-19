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
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";

const questions = [
	"Merasa kesal karena sesuatu yang terjadi secara tidak terduga?",
	"Merasa tidak mampu mengendalikan hal-hal penting dalam hidup Anda?",
	'Merasa gugup dan "stres"?',
	"Merasa percaya diri terhadap kemampuan Anda dalam menangani masalah pribadi?",
	"Merasa bahwa segala sesuatu berjalan sesuai keinginan Anda?",
	"Merasa bahwa Anda tidak mampu menangani semua hal yang harus Anda lakukan?",
	"Dapat mengendalikan rasa kesal dalam hidup Anda?",
	"Merasa bahwa Anda memegang kendali atas segalanya?",
	"Merasa marah karena hal-hal yang berada di luar kendali Anda?",
	"Merasa bahwa kesulitan menumpuk begitu banyak sehingga Anda tidak dapat mengatasinya?",
];

// Define labels for the answer options
const answerOptions = [
	{ value: 0, label: "Tidak Pernah" },
	{ value: 1, label: "Hampir Tidak Pernah" },
	{ value: 2, label: "Kadang-kadang" },
	{ value: 3, label: "Cukup Sering" },
	{ value: 4, label: "Sangat Sering" },
];

// Component for a single question with rating options
const StressQuestion = ({
	question,
	index,
	value,
	onChange,
}: {
	question: string;
	index: number;
	value: number;
	onChange: (value: number) => void;
}) => {
	return (
		<View style={styles.questionContainer}>
			<Text style={styles.questionText}>
				{index + 1}. {question}
			</Text>
			<View style={styles.optionsContainer}>
				{answerOptions.map((option) => (
					<TouchableOpacity
						key={option.value}
						style={[
							styles.optionButton,
							value === option.value && styles.optionSelected,
						]}
						onPress={() => onChange(option.value)}
					>
						<Text
							style={[
								styles.optionText,
								value === option.value && styles.optionTextSelected,
							]}
						>
							{option.value}
						</Text>
						<Text
							style={[
								styles.optionLabel,
								value === option.value && styles.optionTextSelected,
							]}
						>
							{option.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

// Skeleton loading component for stress form
const StressSkeleton = () => {
	return (
		<>
			{[1, 2, 3].map((item) => (
				<View key={item} style={styles.skeletonQuestion}>
					<View style={styles.skeletonQuestionText} />
					<View style={styles.skeletonOptionsContainer}>
						{[0, 1, 2, 3, 4].map((option) => (
							<View key={option} style={styles.skeletonOption} />
						))}
					</View>
				</View>
			))}
			<View style={styles.section}>
				<View style={styles.skeletonSectionTitle} />
				<View style={styles.skeletonNotes} />
			</View>
		</>
	);
};

const StressScreen = ({ navigation, route }: any) => {
	const theme = useTheme();
	const { colors } = theme;
	const {
		date,
		journalType = "stress",
		title = "Stress",
	} = route.params || {
		date: new Date().toISOString().split("T")[0],
		journalType: "stress",
		title: "Stress",
	};

	// Initialize answers with 10 questions, all set to value 2 (middle option)
	const [answers, setAnswers] = useState<number[]>(Array(10).fill(2));
	const [notes, setNotes] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [totalScore, setTotalScore] = useState(0);

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

	// Handle answer change for a specific question
	const handleAnswerChange = (index: number, value: number) => {
		const newAnswers = [...answers];
		newAnswers[index] = value;
		setAnswers(newAnswers);

		// Calculate total score
		calculateTotalScore(newAnswers);
	};

	// Calculate the total stress score
	const calculateTotalScore = (answerValues: number[]) => {
		// Questions 4, 5, 7, and 8 are positively stated items and scored in the reverse direction
		// These are at indices 3, 4, 6, and 7 in our zero-based array
		let score = answerValues.reduce((total, value, index) => {
			// For positively stated items (indices 3, 4, 6, 7), reverse the score (4 - value)
			if (index === 3 || index === 4 || index === 6 || index === 7) {
				return total + (4 - value);
			}
			// For other items, use the value as is
			return total + value;
		}, 0);

		setTotalScore(score);
	};

	// Get stress level category based on total score
	const getStressCategory = () => {
		if (totalScore <= 13) {
			return { text: "Rendah", color: "#4CAF50" };
		} else if (totalScore <= 26) {
			return { text: "Sedang", color: "#FFA500" };
		} else {
			return { text: "Tinggi", color: "#F44336" };
		}
	};

	// Load existing stress data
	const loadStressData = async () => {
		if (!auth.currentUser) return;

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Use the document path structure from the image
			const stressRef = doc(db, `activities/${userId}/stress/${date}`);
			const docSnap = await getDoc(stressRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				if (data.answers && Array.isArray(data.answers)) {
					setAnswers(data.answers);
					calculateTotalScore(data.answers);
				}
				if (data.total_score) {
					setTotalScore(data.total_score);
				}
				setNotes(data.notes || "");
			}
		} catch (error) {
			console.error("Error loading stress data:", error);
			Alert.alert("Error", "Failed to load stress data");
		} finally {
			// Add a small delay to ensure the UI has time to update
			setTimeout(() => {
				setIsLoading(false);
			}, 300);
		}
	};

	// Save stress data
	const saveStressData = async () => {
		if (!auth.currentUser) {
			Alert.alert("Error", "You must be logged in to save data");
			return;
		}

		setIsLoading(true);
		try {
			const userId = auth.currentUser.uid;
			// Use the document path structure from the image
			const stressRef = doc(db, `activities/${userId}/stress/${date}`);

			await setDoc(stressRef, {
				date,
				answers,
				total_score: totalScore,
				notes,
				createdAt: new Date().toISOString(),
			});

			Alert.alert("Success", "Stress data saved successfully");
			// Navigate to the Journal tab in BottomNavigation
			navigation.navigate("BottomNavigation", {
				screen: "Journal",
			});
		} catch (error) {
			console.error("Error saving stress data:", error);
			Alert.alert("Error", "Failed to save stress data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadStressData();
	}, [date]);

	const stressCategory = getStressCategory();

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBack}>
					<Image source={IMAGES.leftarrow} style={styles.backIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Tingkat Stress</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
			>
				<View style={styles.dateContainer}>
					<Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
				</View>

				{!isLoading && (
					<View style={styles.scoreContainer}>
						<Text style={styles.scoreLabel}>Skor Total:</Text>
						<Text style={[styles.scoreValue, { color: stressCategory.color }]}>
							{totalScore} - {stressCategory.text}
						</Text>
					</View>
				)}

				{isLoading ? (
					<StressSkeleton />
				) : (
					<>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>
								Kuesioner Tingkat Stress (PSS-10)
							</Text>
							<Text style={styles.subtitle}>
								Dalam sebulan terakhir, seberapa sering Anda...
							</Text>

							{questions.map((question, index) => (
								<StressQuestion
									key={index}
									question={question}
									index={index}
									value={answers[index]}
									onChange={(value) => handleAnswerChange(index, value)}
								/>
							))}
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Catatan</Text>
							<TextInput
								style={styles.notesInput}
								value={notes}
								onChangeText={setNotes}
								placeholder="Tambahkan catatan tentang kondisi stress Anda hari ini..."
								multiline
								numberOfLines={4}
								textAlignVertical="top"
							/>
						</View>
					</>
				)}

				<TouchableOpacity
					style={[
						styles.saveButton,
						isLoading ? styles.saveButtonDisabled : null,
					]}
					onPress={saveStressData}
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
	scoreContainer: {
		marginTop: 10,
		marginBottom: 20,
		padding: 15,
		backgroundColor: "#f8f8f8",
		borderRadius: 10,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#eaeaea",
	},
	scoreLabel: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: "#333",
		marginRight: 8,
	},
	scoreValue: {
		...FONTS.fontSemiBold,
		fontSize: 18,
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
	subtitle: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: "#666",
		marginBottom: 15,
	},
	questionContainer: {
		marginBottom: 20,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	questionText: {
		...FONTS.fontMedium,
		fontSize: 15,
		color: "#333",
		marginBottom: 12,
	},
	optionsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		flexWrap: "wrap",
	},
	optionButton: {
		width: "18%",
		backgroundColor: "#F0F0F0",
		borderRadius: 8,
		paddingVertical: 10,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	optionSelected: {
		backgroundColor: COLORS.primaryBlue + "20",
		borderColor: COLORS.primaryBlue,
	},
	optionText: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: "#666",
		marginBottom: 4,
	},
	optionLabel: {
		...FONTS.fontRegular,
		fontSize: 10,
		color: "#666",
		textAlign: "center",
	},
	optionTextSelected: {
		color: COLORS.primaryBlue,
	},
	notesInput: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 10,
		padding: 12,
		...FONTS.fontRegular,
		fontSize: 15,
		backgroundColor: "#f9f9f9",
		height: 100,
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
	// Skeleton styles
	skeletonQuestion: {
		marginBottom: 25,
	},
	skeletonQuestionText: {
		width: "90%",
		height: 18,
		backgroundColor: "#E0E0E0",
		borderRadius: 4,
		marginBottom: 15,
	},
	skeletonOptionsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	skeletonOption: {
		width: "18%",
		height: 45,
		backgroundColor: "#E0E0E0",
		borderRadius: 8,
	},
	skeletonSectionTitle: {
		width: "70%",
		height: 20,
		backgroundColor: "#E0E0E0",
		borderRadius: 4,
		marginBottom: 10,
	},
	skeletonNotes: {
		width: "100%",
		height: 100,
		backgroundColor: "#E0E0E0",
		borderRadius: 10,
	},
});

export default StressScreen;
