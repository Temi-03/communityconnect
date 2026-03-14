import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth,getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
const firebaseConfig = {
  apiKey:"YOUR_API_KEY",
  authDomain: "YOIUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {//store on devive auth state so that user does not need to login every time they open the app
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);//firestore database instance

export { auth, db };
