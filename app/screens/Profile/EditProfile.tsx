import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	Image,
	TouchableOpacity,
	StyleSheet,
	Platform,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import Header from "../../layout/Header";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import { IMAGES } from "../../constants/Images";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { COLORS, FONTS } from "../../constants/theme";
import {
	pickImage,
	takePhoto,
	uploadToCloudinary,
} from "../../services/cloudinary.service";
import {
	UserProfile,
	fetchUserProfile,
	updateProfilePicture,
} from "../../services/user.service";
import {
	collection,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import Modal from "react-native-modal";

const EditProfile = () => {
	const theme = useTheme();
	const { colors }: { colors: any } = theme;
	const navigation = useNavigation<any>();

	// Form state
	const [userData, setUserData] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);

	// Focus states for inputs
	const [nameIsFocused, setNameIsFocused] = useState(false);
	const [heightIsFocused, setHeightIsFocused] = useState(false);
	const [weightIsFocused, setWeightIsFocused] = useState(false);
	const [phoneIsFocused, setPhoneIsFocused] = useState(false);

	// Load user data
	useEffect(() => {
		const loadUserData = async () => {
			setIsLoading(true);
			try {
				const profile = await fetchUserProfile();
				if (profile) {
					setUserData(profile);
				} else {
					Alert.alert("Error", "Failed to load user data");
					navigation.goBack();
				}
			} catch (error) {
				console.error("Error loading user data:", error);
				Alert.alert("Error", "Failed to load user data");
				navigation.goBack();
			} finally {
				setIsLoading(false);
			}
		};

		loadUserData();
	}, [navigation]);

	// Handle form value changes
	const handleChange = (field: keyof UserProfile, value: string) => {
		if (userData) {
			setUserData({
				...userData,
				[field]: value,
			});
		}
	};

	// Handle profile picture update
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
				setUserData((prev) =>
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

	// Save user profile changes
	const handleSave = async () => {
		if (!userData || !auth.currentUser) return;

		setIsSaving(true);
		try {
			const userId = auth.currentUser.uid;

			// Find the user document with the matching uid
			const userQuery = query(
				collection(db, "users"),
				where("uid", "==", userId)
			);
			const querySnapshot = await getDocs(userQuery);

			if (querySnapshot.empty) {
				Alert.alert("Error", "User document not found");
				setIsSaving(false);
				return;
			}

			// Get reference to the user document
			const userDocRef = doc(db, "users", querySnapshot.docs[0].id);

			// Update editable fields
			await updateDoc(userDocRef, {
				name: userData.name,
				height: userData.height,
				weight: userData.weight,
				phone: userData.phone,
				// Recalculate IMT
				imt:
					parseFloat(userData.weight) /
					(parseFloat(userData.height) / 100) ** 2,
			});

			Alert.alert("Success", "Profile updated successfully");
			navigation.goBack();
		} catch (error) {
			console.error("Error updating profile:", error);
			Alert.alert("Error", "Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	// Show loading indicator while fetching data
	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: colors.background,
				}}
			>
				<ActivityIndicator size="large" color={COLORS.primary} />
				<Text
					style={{ marginTop: 10, ...FONTS.fontRegular, color: colors.text }}
				>
					Loading...
				</Text>
			</View>
		);
	}

	return (
		<View style={{ backgroundColor: colors.background, flex: 1 }}>
			<Header title="Edit Profile" leftIcon="back" titleRight />

			<Modal
				isVisible={isImagePickerVisible}
				onBackdropPress={() => setIsImagePickerVisible(false)}
				style={{ margin: 0, justifyContent: "flex-end" }}
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
						<Text style={[styles.cancelText, { color: COLORS.primary }]}>
							Cancel
						</Text>
					</TouchableOpacity>
				</View>
			</Modal>

			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 15,
					marginBottom: 50,
				}}
			>
				<View style={{ alignItems: "center", marginTop: 20 }}>
					<View style={styles.profileImageWrapper}>
						<TouchableOpacity
							style={styles.profileImageContainer}
							onPress={() => setIsImagePickerVisible(true)}
							disabled={imageLoading}
						>
							{imageLoading ? (
								<ActivityIndicator size="large" color="#FFF" />
							) : userData?.profilePicture ? (
								<Image
									source={{ uri: userData.profilePicture }}
									style={styles.profileImage}
								/>
							) : (
								<Image source={IMAGES.small6} style={styles.profileImage} />
							)}
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.editIconContainer}
							onPress={() => setIsImagePickerVisible(true)}
							disabled={imageLoading}
						>
							<Image source={IMAGES.edit} style={styles.editIcon} />
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.formContainer}>
					<View style={styles.formGroup}>
						<Text style={[styles.label, { color: colors.text }]}>
							Full Name
						</Text>
						<Input
							value={userData?.name || ""}
							onChangeText={(text) => handleChange("name", text)}
							placeholder="Enter your full name"
							containerStyle={styles.input}
							isFocused={nameIsFocused}
							onFocus={() => setNameIsFocused(true)}
							onBlur={() => setNameIsFocused(false)}
						/>
					</View>

					<View style={styles.formGroup}>
						<Text style={[styles.label, { color: colors.text }]}>
							Phone Number
						</Text>
						<Input
							value={userData?.phone || ""}
							onChangeText={(text) => handleChange("phone", text)}
							placeholder="Enter your phone number"
							containerStyle={styles.input}
							isFocused={phoneIsFocused}
							onFocus={() => setPhoneIsFocused(true)}
							onBlur={() => setPhoneIsFocused(false)}
							keyboardType="phone-pad"
						/>
					</View>

					<View style={styles.formRow}>
						<View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
							<Text style={[styles.label, { color: colors.text }]}>
								Height (cm)
							</Text>
							<Input
								value={userData?.height || ""}
								onChangeText={(text) => handleChange("height", text)}
								placeholder="Height"
								containerStyle={styles.input}
								isFocused={heightIsFocused}
								onFocus={() => setHeightIsFocused(true)}
								onBlur={() => setHeightIsFocused(false)}
								keyboardType="numeric"
							/>
						</View>

						<View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
							<Text style={[styles.label, { color: colors.text }]}>
								Weight (kg)
							</Text>
							<Input
								value={userData?.weight || ""}
								onChangeText={(text) => handleChange("weight", text)}
								placeholder="Weight"
								containerStyle={styles.input}
								isFocused={weightIsFocused}
								onFocus={() => setWeightIsFocused(true)}
								onBlur={() => setWeightIsFocused(false)}
								keyboardType="numeric"
							/>
						</View>
					</View>

					<View style={styles.formGroup}>
						<Text style={[styles.label, { color: colors.text }]}>Gender</Text>
						<View
							style={[styles.disabledInput, { backgroundColor: colors.border }]}
						>
							<Text style={{ ...FONTS.fontRegular, color: colors.text }}>
								{userData?.gender || "Not specified"}
							</Text>
						</View>
						<Text style={styles.helperText}>Gender cannot be changed</Text>
					</View>

					<View style={styles.formGroup}>
						<Text style={[styles.label, { color: colors.text }]}>Username</Text>
						<View
							style={[styles.disabledInput, { backgroundColor: colors.border }]}
						>
							<Text style={{ ...FONTS.fontRegular, color: colors.text }}>
								{userData?.username || "Not specified"}
							</Text>
						</View>
						<Text style={styles.helperText}>Username cannot be changed</Text>
					</View>

					<View style={styles.formGroup}>
						<Text style={[styles.label, { color: colors.text }]}>
							Birth Date
						</Text>
						<View
							style={[styles.disabledInput, { backgroundColor: colors.border }]}
						>
							<Text style={{ ...FONTS.fontRegular, color: colors.text }}>
								{userData?.birthDate
									? new Date(userData.birthDate).toLocaleDateString("id-ID")
									: "Not specified"}
							</Text>
						</View>
						<Text style={styles.helperText}>Birth date cannot be changed</Text>
					</View>

					<Button
						title={isSaving ? "Saving..." : "Save Changes"}
						onPress={handleSave}
						disabled={isSaving}
						style={{ marginTop: 30 }}
					/>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	profileImageWrapper: {
		position: "relative",
		width: 130,
		height: 130,
		marginBottom: 30,
	},
	profileImageContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
	},
	profileImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
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
		tintColor: COLORS.primary,
	},
	formContainer: {
		paddingHorizontal: 15,
		marginTop: 10,
	},
	formGroup: {
		marginBottom: 20,
	},
	formRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	label: {
		...FONTS.fontMedium,
		fontSize: 14,
		marginBottom: 8,
	},
	input: {
		height: 50,
	},
	disabledInput: {
		height: 50,
		borderRadius: 10,
		paddingHorizontal: 15,
		justifyContent: "center",
		opacity: 0.7,
	},
	helperText: {
		...FONTS.fontRegular,
		fontSize: 12,
		color: "#999",
		marginTop: 4,
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
});

export default EditProfile;
