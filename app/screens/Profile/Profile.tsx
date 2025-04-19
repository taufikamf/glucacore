import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	ScrollView,
	StyleSheet,
	Alert,
	Modal,
	ActivityIndicator,
} from "react-native";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { IMAGES } from "../../constants/Images";
import { COLORS, FONTS } from "../../constants/theme";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import Header from "../../layout/Header";
import {
	UserProfile,
	fetchUserProfile,
	updateProfilePicture,
} from "../../services/user.service";
import { auth } from "../../config/firebase";
import {
	pickImage,
	takePhoto,
	uploadToCloudinary,
} from "../../services/cloudinary.service";
import { signOut } from "firebase/auth";

type ProfileScreenProps = StackScreenProps<RootStackParamList, "Profile">;

const Profile = ({ navigation }: ProfileScreenProps) => {
	const theme = useTheme();
	const { colors }: { colors: any } = theme;

	// State for user profile data
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [imageLoading, setImageLoading] = useState(false);
	const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);

	// Calculate age from birth date
	const calculateAge = (birthDateString: string): string => {
		try {
			const birthDate = new Date(birthDateString);
			const today = new Date();
			let age = today.getFullYear() - birthDate.getFullYear();
			const m = today.getMonth() - birthDate.getMonth();

			if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}

			return age.toString();
		} catch (error) {
			console.error("Error calculating age:", error);
			return userProfile?.age || "";
		}
	};

	// Format date for display
	const formatDate = (dateString: string): string => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("id-ID", {
				day: "2-digit",
				month: "long",
				year: "numeric",
			});
		} catch (error) {
			return dateString;
		}
	};

	// Load user profile data
	useEffect(() => {
		const loadUserProfile = async () => {
			setIsLoading(true);
			try {
				const profileData = await fetchUserProfile();
				setUserProfile(profileData);
			} catch (error) {
				console.error("Error loading user profile:", error);
				Alert.alert("Error", "Failed to load user profile data");
			} finally {
				setIsLoading(false);
			}
		};

		loadUserProfile();

		// Add listener for when user comes back from edit profile
		const unsubscribe = navigation.addListener("focus", () => {
			loadUserProfile();
		});

		return unsubscribe;
	}, [navigation]);

	// Handle profile picture selection
	const handleProfilePictureUpdate = async (source: "gallery" | "camera") => {
		setIsImagePickerVisible(false);
		setImageLoading(true);

		try {
			// Get image URI from gallery or camera
			const imageUri =
				source === "gallery" ? await pickImage() : await takePhoto();

			if (!imageUri) {
				setImageLoading(false);
				return;
			}

			// Upload to Cloudinary
			const cloudinaryUrl = await uploadToCloudinary(imageUri);

			if (!cloudinaryUrl) {
				Alert.alert("Error", "Failed to upload image. Please try again.");
				setImageLoading(false);
				return;
			}

			// Update Firestore with the new URL
			const success = await updateProfilePicture(cloudinaryUrl);

			if (success) {
				// Update local state
				setUserProfile((prev) =>
					prev ? { ...prev, profilePicture: cloudinaryUrl } : null
				);
				Alert.alert("Success", "Profile picture updated successfully.");
			} else {
				Alert.alert("Error", "Failed to update profile picture in database.");
			}
		} catch (error) {
			console.error("Error updating profile picture:", error);
			Alert.alert(
				"Error",
				"An error occurred while updating your profile picture."
			);
		} finally {
			setImageLoading(false);
		}
	};

	// Add logout function
	const handleLogout = async () => {
		try {
			await signOut(auth);
			// Navigate to SingIn screen after logout (note the spelling)
			navigation.reset({
				index: 0,
				routes: [{ name: "SingIn" }],
			});
		} catch (error) {
			console.error("Error signing out: ", error);
			Alert.alert("Error", "Failed to log out. Please try again.");
		}
	};

	// Profile picture selection modal
	const ImagePickerModal = () => (
		<Modal
			visible={isImagePickerVisible}
			transparent={true}
			animationType="slide"
			onRequestClose={() => setIsImagePickerVisible(false)}
		>
			<TouchableOpacity
				style={styles.modalOverlay}
				activeOpacity={1}
				onPress={() => setIsImagePickerVisible(false)}
			>
				<View style={[styles.modalContent, { backgroundColor: colors.card }]}>
					<Text style={[styles.modalTitle, { color: colors.title }]}>
						Update Profile Picture
					</Text>

					<TouchableOpacity
						style={styles.modalOption}
						onPress={() => handleProfilePictureUpdate("camera")}
					>
						<Text style={[styles.modalOptionText, { color: colors.title }]}>
							Take Photo
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.modalOption}
						onPress={() => handleProfilePictureUpdate("gallery")}
					>
						<Text style={[styles.modalOptionText, { color: colors.title }]}>
							Choose from Gallery
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.cancelButton, { borderTopColor: colors.border }]}
						onPress={() => setIsImagePickerVisible(false)}
					>
						<Text style={[styles.cancelText, { color: COLORS.primaryBlue }]}>
							Cancel
						</Text>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</Modal>
	);

	if (isLoading) {
		return (
			<View
				style={[
					{
						flex: 1,
						backgroundColor: colors.card,
						justifyContent: "center",
						alignItems: "center",
					},
				]}
			>
				<ActivityIndicator size="large" color={COLORS.primaryBlue} />
				<Text
					style={{ ...FONTS.fontRegular, color: colors.text, marginTop: 10 }}
				>
					Loading profile...
				</Text>
			</View>
		);
	}

	return (
		<View style={{ backgroundColor: colors.card, flex: 1 }}>
			<Header
				title="Profile"
				leftIcon={"back"}
				rightIcon2={"Edit"}
				onPressRightIcon2={() => navigation.navigate("EditProfile")}
			/>

			<ImagePickerModal />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
			>
				<View
					style={[
						GlobalStyleSheet.container,
						{ alignItems: "center", marginTop: 50, padding: 0 },
					]}
				>
					<View style={styles.profilePictureWrapper}>
						<TouchableOpacity
							style={styles.sectionimg}
							onPress={() => setIsImagePickerVisible(true)}
							disabled={imageLoading}
						>
							{imageLoading ? (
								<ActivityIndicator size="large" color={COLORS.white} />
							) : userProfile?.profilePicture ? (
								<Image
									style={{ height: 104, width: 104, borderRadius: 52 }}
									source={{ uri: userProfile.profilePicture }}
								/>
							) : (
								<Image
									style={{ height: 104, width: 104 }}
									source={IMAGES.small6}
								/>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.editIconContainer}
							onPress={() => setIsImagePickerVisible(true)}
							disabled={imageLoading}
						>
							<Image source={IMAGES.cameraretro} style={styles.editIcon} />
						</TouchableOpacity>
					</View>

					<Text
						style={{ ...FONTS.fontSemiBold, fontSize: 28, color: colors.title }}
					>
						{userProfile?.name || "User"}
					</Text>

					<Text
						style={{
							...FONTS.fontRegular,
							fontSize: 16,
							color: COLORS.primaryBlue,
						}}
					>
						{userProfile?.username || "username"}
					</Text>
				</View>

				<View
					style={[
						GlobalStyleSheet.container,
						{ paddingHorizontal: 40, marginTop: 20 },
					]}
				>
					<View>
						{/* Basic Info - Redesigned without icons */}
						<View style={styles.profileItem}>
							<Text style={styles.labelTextNew}>Usia</Text>
							<Text style={styles.valueTextNew}>
								{userProfile?.birthDate
									? calculateAge(userProfile.birthDate)
									: userProfile?.age || ""}
							</Text>
						</View>

						<View style={styles.profileItem}>
							<Text style={styles.labelTextNew}>Jenis Kelamin</Text>
							<Text style={styles.valueTextNew}>
								{userProfile?.gender || ""}
							</Text>
						</View>

						<View style={styles.profileItem}>
							<Text style={styles.labelTextNew}>Tinggi Badan</Text>
							<Text style={styles.valueTextNew}>
								{userProfile?.height || ""} cm
							</Text>
						</View>

						<View style={styles.profileItem}>
							<Text style={styles.labelTextNew}>Berat Badan</Text>
							<Text style={styles.valueTextNew}>
								{userProfile?.weight || ""} kg
							</Text>
						</View>

						<View style={styles.profileItem}>
							<Text style={styles.labelTextNew}>BMI</Text>
							<Text style={styles.valueTextNew}>
								{userProfile?.imt?.toFixed(2) || ""}
							</Text>
						</View>

						<View style={styles.profileItem}>
							<Text style={styles.labelTextNew}>Nomor Telefon</Text>
							<Text style={styles.valueTextNew}>
								{userProfile?.phone || ""}
							</Text>
						</View>

						<View style={styles.profileItem}>
							<Text style={styles.labelTextNew}>Tanggal Lahir</Text>
							<Text style={styles.valueTextNew}>
								{userProfile?.birthDate
									? formatDate(userProfile.birthDate)
									: ""}
							</Text>
						</View>
					</View>

					<View style={styles.logoutButtonContainer}>
						<TouchableOpacity
							style={styles.logoutButton}
							onPress={handleLogout}
						>
							<Text style={styles.logoutButtonText}>Logout</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	profileRow: {
		flexDirection: "row",
		width: "100%",
		gap: 20,
		justifyContent: "flex-start",
		marginBottom: 25,
		alignItems: "flex-start",
	},
	profilePictureWrapper: {
		position: "relative",
		width: 110,
		height: 110,
		marginBottom: 25,
	},
	sectionimg: {
		height: 104,
		width: 104,
		borderRadius: 52,
		backgroundColor: COLORS.primaryBlue,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	},
	editIconContainer: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: COLORS.white,
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		zIndex: 10,
	},
	editIcon: {
		width: 20,
		height: 20,
		tintColor: COLORS.primaryBlue,
	},
	labelText: {
		...FONTS.fontRegular,
		fontSize: 12,
	},
	valueText: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: "#333",
		marginTop: 5,
	},
	cardimg: {
		height: 54,
		width: 54,
		borderRadius: 27,
		backgroundColor: COLORS.card,
		shadowColor: "rgba(0,0,0,0.5)",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.34,
		shadowRadius: 18.27,
		elevation: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	modalContent: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
	},
	modalTitle: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		marginBottom: 20,
		textAlign: "center",
	},
	modalOption: {
		paddingVertical: 15,
		alignItems: "center",
	},
	modalOptionText: {
		...FONTS.fontMedium,
		fontSize: 16,
	},
	cancelButton: {
		marginTop: 10,
		paddingVertical: 15,
		borderTopWidth: 1,
		alignItems: "center",
	},
	cancelText: {
		...FONTS.fontSemiBold,
		fontSize: 16,
	},
	logoutButtonContainer: {
		marginTop: 30,
		alignItems: "center",
	},
	logoutButton: {
		backgroundColor: COLORS.primaryBlue,
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 10,
		width: "100%",
		alignItems: "center",
	},
	logoutButtonText: {
		...FONTS.fontSemiBold,
		fontSize: 16,
		color: COLORS.white,
	},
	iconText: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: COLORS.primaryBlue,
	},
	profileItem: {
		marginBottom: 20,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	labelTextNew: {
		...FONTS.fontSemiBold,
		fontSize: 18,
		color: COLORS.primaryBlue,
		marginBottom: 8,
	},
	valueTextNew: {
		...FONTS.fontMedium,
		fontSize: 16,
		color: "#333",
	},
});

export default Profile;
