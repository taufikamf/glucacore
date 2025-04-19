import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  UserCredential 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

interface UserBiodata {
  fullName: string;
  phoneNumber: string;
  address: string;
}

export const registerUser = async (
  email: string, 
  password: string, 
  biodata: UserBiodata
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store user biodata in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      ...biodata,
      createdAt: new Date().toISOString()
    });

    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    throw error;
  }
}; 