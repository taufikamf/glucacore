import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Cloudinary configuration
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dppmsqwgi/upload';
const UPLOAD_PRESET = 'diabet_app'; // Replace with your actual upload preset name

/**
 * Opens the image picker to select an image from the device gallery
 */
export const pickImage = async (): Promise<string | null> => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('Permission to access media library was denied');
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

/**
 * Opens the camera to take a new profile picture
 */
export const takePhoto = async (): Promise<string | null> => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('Permission to access camera was denied');
      return null;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

/**
 * Compresses and optimizes an image for upload
 */
export const prepareImageForUpload = async (uri: string): Promise<string> => {
  try {
    // Resize and compress the image
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return manipResult.uri;
  } catch (error) {
    console.error('Error preparing image:', error);
    return uri; // Return original URI if manipulation fails
  }
};

/**
 * Uploads an image to Cloudinary
 */
export const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
  try {
    // Prepare the image (resize and compress)
    const optimizedImageUri = await prepareImageForUpload(imageUri);
    
    // Create form data for upload
    const formData = new FormData();
    
    // Append the image
    formData.append('file', {
      uri: optimizedImageUri,
      type: 'image/jpeg',
      name: 'profile_image.jpg',
    } as any);
    
    // Add upload preset
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = await response.json();
    
    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.error('Cloudinary upload failed:', data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}; 