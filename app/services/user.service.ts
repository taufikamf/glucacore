import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Interface for user profile data
 */
export interface UserProfile {
  uid: string;
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  phone: string;
  username: string;
  imt: number;
  birthDate: string;
  profilePicture?: string;
  createdAt: Date | string;
}

/**
 * Fetches the current user's profile data from Firestore
 */
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      return null;
    }

    const userId = auth.currentUser.uid;
    
    // Query the users collection for documents with matching uid
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      console.error('No user profile found for this user ID');
      return null;
    }

    // Get the first matching user document
    const userData = querySnapshot.docs[0].data() as UserProfile;
    
    return userData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Updates the profile picture URL in the user's Firestore document
 */
export const updateProfilePicture = async (profilePictureUrl: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      return false;
    }

    const userId = auth.currentUser.uid;
    
    // Query to find the user document with the matching uid
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      console.error('No user profile found for this user ID');
      return false;
    }

    // Get the reference to the first matching document
    const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
    
    // Update only the profile picture field
    await updateDoc(userDocRef, {
      profilePicture: profilePictureUrl
    });
    
    return true;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return false;
  }
}; 