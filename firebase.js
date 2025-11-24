import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA3aW9WflmqVusOmDH6SaRpcClhqRHaucY",
  authDomain: "communityconnect-1df84.firebaseapp.com",
  projectId: "communityconnect-1df84",
  storageBucket: "communityconnect-1df84.firebasestorage.app",
  messagingSenderId: "601783968404",
  appId: "1:601783968404:web:57155041304465d41d0a81",
  measurementId: "G-6KEXXM6RS7"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db };
