import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";  // ✅ fixed

const firebaseConfig = {
  apiKey: "AIzaSyDkQDxLN1qf4qu-Pv67nfEMpk12nn9VGnM",
  authDomain: "skill-swap-cfa89.firebaseapp.com",
  databaseURL: "https://skill-swap-cfa89-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ add your correct region URL
  projectId: "skill-swap-cfa89",
  storageBucket: "skill-swap-cfa89.firebasestorage.app",
  messagingSenderId: "935162177886",
  appId: "1:935162177886:web:c47d2f1f8283f90a68c7cf",
  measurementId: "G-N2591WBQZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Database
export const auth = getAuth(app);
export const db = getDatabase(app);
