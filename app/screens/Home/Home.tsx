import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	Image,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ImageBackground,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { IMAGES } from "../../constants/Images";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import CheckoutItems from "../../components/CheckoutItems";
import { auth, db } from "../../config/firebase";
import { fetchUserProfile } from "../../services/user.service";

type HomeScreenProps = StackScreenProps<RootStackParamList, "Home">;

export const Home = ({ navigation }: HomeScreenProps) => {
	const theme = useTheme();
	const { colors }: { colors: any } = theme;
	const [isLoading, setIsLoading] = useState(false);
	const [username, setUsername] = useState("");
	const [profilePicture, setProfilePicture] = useState<string | null>(null);

	const fetchUserData = async () => {
		if (!auth.currentUser) {
			setIsLoading(false);
			return;
		}

		try {
			// Get username from auth
			const userName = auth.currentUser.displayName || "";
			setUsername(userName);

			// Get profile picture from user profile
			const userProfile = await fetchUserProfile();
			if (userProfile && userProfile.profilePicture) {
				setProfilePicture(userProfile.profilePicture);
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};

	const articles = [
		{
			id: "1",
			title: "ARTIKEL DIABETES MELLITUS",
			date: "Jan 10, 2024",
			image: IMAGES.article1,
		},
		{
			id: "2",
			title: "ARTIKEL KADAR GULA DARAH",
			date: "Dec 12, 2023",
			image: IMAGES.article2,
		},
	];

	useEffect(() => {
		fetchUserData();
	}, []);

	// Add listener for when user comes back from profile screen
	useEffect(() => {
		const unsubscribe = navigation.addListener("focus", () => {
			fetchUserData();
		});

		return unsubscribe;
	}, [navigation]);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.topSection}>
				{/* Header Profile */}
				<View style={styles.header}>
					<View style={styles.profileContainer}>
						{profilePicture ? (
							<Image
								source={{ uri: profilePicture }}
								style={styles.profileImage}
							/>
						) : (
							<Image source={IMAGES.user} style={styles.profileImage} />
						)}
						<View style={styles.profileInfo}>
							<Text style={styles.profileName}>{"HI, " + username}</Text>
						</View>
					</View>

					<TouchableOpacity style={styles.notificationButton}>
						<Image source={IMAGES.ball2} style={styles.notificationIcon} />
					</TouchableOpacity>
				</View>

				{/* "Tahukah Kamu?" Card */}
				<View style={styles.tahukahContainer}>
					<TouchableOpacity
						activeOpacity={0.9}
						style={styles.educationCardContainer}
					>
						<ImageBackground
							source={IMAGES.background}
							style={styles.educationCardBackground}
							imageStyle={{ borderRadius: 20, opacity: 0.2 }}
						>
							<View style={styles.educationCard}>
								<View style={styles.educationContent}>
									<Text style={styles.educationTitle}>Tahukah</Text>
									<Text style={styles.educationTitle}>Kamu?</Text>
								</View>
								<Image
									source={IMAGES.homeHeader}
									style={styles.educationImage}
								/>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				</View>
			</View>

			{/* Bottom white section with articles */}
			<View style={styles.bottomSection}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 20 }}
				>
					{/* Articles Section */}
					<View style={styles.articlesHeader}>
						<Text style={styles.sectionTitle}>Article</Text>
						<TouchableOpacity>
							<Text style={styles.viewAllText}>Lihat Semua</Text>
						</TouchableOpacity>
					</View>

					{articles.map((article, index) => (
						<TouchableOpacity
							key={article.id}
							style={styles.articleCard}
							onPress={() =>
								navigation.navigate("ArticleDetail", { articleId: article.id })
							}
						>
							<Image source={article.image} style={styles.articleImage} />
							<View style={styles.articleContent}>
								<Text style={styles.articleTitle}>{article.title}</Text>
								<View style={styles.sourceContainer}>
									<Image source={IMAGES.user2} style={styles.doctorIcon} />
									<Text style={styles.sourceText}>Sumber : </Text>
									<Text style={styles.dateText}>{article.date}</Text>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	topSection: {
		backgroundColor: "#E3F1FF",
		paddingBottom: 50, // Add some padding at the bottom for overlap
	},
	bottomSection: {
		backgroundColor: COLORS.white,
		flex: 1,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 20,
		paddingTop: 50,
		marginTop: -50,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 20,
	},
	tahukahContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		marginTop: 30,
	},
	backButton: {
		width: 30,
		height: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	backIcon: {
		width: 20,
		height: 20,
		tintColor: "#666",
	},
	profileContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 5,
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.primary, // Add background color for placeholder
	},
	profileInfo: {
		marginLeft: 10,
	},
	profileName: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#333",
	},
	locationContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	locationIcon: {
		width: 12,
		height: 12,
		tintColor: "#666",
	},
	locationText: {
		...FONTS.fontRegular,
		fontSize: 12,
		color: "#666",
		marginLeft: 5,
	},
	notificationButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
	},
	notificationIcon: {
		width: 20,
		height: 20,
		tintColor: "#666",
	},
	container: {
		padding: 20,
	},
	educationCardContainer: {
		borderRadius: 20,
		width: "90%",
		alignSelf: "center",
		shadowColor: "rgba(0,0,0,0.2)",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.4,
		shadowRadius: 5,
		elevation: 6,
	},
	educationCardBackground: {
		overflow: "hidden",
		borderRadius: 20,
	},
	educationCard: {
		backgroundColor: COLORS.white,
		borderRadius: 20,
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	educationContent: {
		flex: 1,
	},
	educationTitle: {
		...FONTS.fontSemiBold,
		fontSize: 30,
		fontWeight: "600",
		color: COLORS.bgBlue,
	},
	educationSubtitle: {
		...FONTS.fontRegular,
		fontSize: 14,
		color: COLORS.white,
		marginTop: 8,
		marginBottom: 15,
	},
	readMoreButton: {
		backgroundColor: "rgba(255,255,255,0.3)",
		paddingVertical: 8,
		paddingHorizontal: 15,
		borderRadius: 30,
		alignSelf: "flex-start",
	},
	readMoreText: {
		...FONTS.fontMedium,
		fontSize: 12,
		color: COLORS.white,
	},
	educationImage: {
		width: 120,
		height: 120,
		resizeMode: "contain",
	},
	articlesHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	sectionTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: "#333",
	},
	viewAllText: {
		...FONTS.fontMedium,
		fontSize: 14,
		color: COLORS.primaryBlue,
	},
	articleCard: {
		backgroundColor: "#fff",
		borderRadius: 15,
		padding: 15,
		marginBottom: 15,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "rgba(0,0,0,0.1)",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 3,
	},
	articleImage: {
		width: 70,
		height: 70,
		borderRadius: 10,
		marginRight: 15,
	},
	articleContent: {
		flex: 1,
	},
	articleTitle: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: "#333",
		marginBottom: 10,
	},
	sourceContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	doctorIcon: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 5,
	},
	sourceText: {
		...FONTS.fontRegular,
		fontSize: 12,
		color: "#666",
	},
	dateText: {
		...FONTS.fontRegular,
		fontSize: 12,
		color: "#666",
	},
});

export default Home;
