import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAaegy48Ez8j0yTbtBl_vKASMBk9pi7Sms",
    authDomain: "diabet-app-4ffb6.firebaseapp.com",
    projectId: "diabet-app-4ffb6",
    storageBucket: "diabet-app-4ffb6.appspot.com",
    messagingSenderId: "557565421055",
    appId: "1:557565421055:web:c956a0976bd2974243b3ca",
    measurementId: "G-DK7173XWH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
// For Firebase v9+, we need to conditionally initialize auth based on the platform
// const auth = getAuth(app);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage }; 