import React, { createContext, useContext, useState, useEffect } from "react";
import {
	User,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	sendPasswordResetEmail,
	onAuthStateChanged,
	updateProfile,
	updateEmail,
	updatePassword,
} from "firebase/auth";
import { auth } from "../config/firebase";

// Define the shape of our Auth context
interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	signIn: (email: string, password: string) => Promise<any>;
	signUp: (email: string, password: string) => Promise<any>;
	signOut: () => Promise<void>;
	forgotPassword: (email: string) => Promise<void>;
	updateUserProfile: (
		displayName: string | null,
		photoURL: string | null
	) => Promise<void>;
	updateUserEmail: (email: string) => Promise<void>;
	updateUserPassword: (password: string) => Promise<void>;
	isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
	signIn: async () => {},
	signUp: async () => {},
	signOut: async () => {},
	forgotPassword: async () => {},
	updateUserProfile: async () => {},
	updateUserEmail: async () => {},
	updateUserPassword: async () => {},
	isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		// Subscribe to auth state changes
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			setIsAuthenticated(firebaseUser !== null);
			setIsLoading(false);
		});

		// Cleanup subscription on unmount
		return unsubscribe;
	}, []);

	// Sign in with email and password
	const signIn = async (email: string, password: string) => {
		try {
			setIsLoading(true);
			const result = await signInWithEmailAndPassword(auth, email, password);
			return result;
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Create a new user with email and password
	const signUp = async (email: string, password: string) => {
		try {
			setIsLoading(true);
			return await createUserWithEmailAndPassword(auth, email, password);
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Sign out
	const signOut = async () => {
		try {
			setIsLoading(true);
			await firebaseSignOut(auth);
		} catch (error) {
			console.error("Error signing out:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Send password reset email
	const forgotPassword = async (email: string) => {
		try {
			setIsLoading(true);
			return await sendPasswordResetEmail(auth, email);
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Update user profile
	const updateUserProfile = async (
		displayName: string | null,
		photoURL: string | null
	) => {
		try {
			if (!auth.currentUser) throw new Error("No authenticated user");

			setIsLoading(true);
			await updateProfile(auth.currentUser, {
				displayName: displayName || auth.currentUser.displayName,
				photoURL: photoURL || auth.currentUser.photoURL,
			});
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Update user email
	const updateUserEmail = async (email: string) => {
		try {
			if (!auth.currentUser) throw new Error("No authenticated user");

			setIsLoading(true);
			await updateEmail(auth.currentUser, email);
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Update user password
	const updateUserPassword = async (password: string) => {
		try {
			if (!auth.currentUser) throw new Error("No authenticated user");

			setIsLoading(true);
			await updatePassword(auth.currentUser, password);
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Provide the auth context value
	const value = {
		user,
		isLoading,
		signIn,
		signUp,
		signOut,
		forgotPassword,
		updateUserProfile,
		updateUserEmail,
		updateUserPassword,
		isAuthenticated,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
