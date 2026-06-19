import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace these with your own Firebase project values (Project Settings > Your apps)
const firebaseConfig = {
  apiKey: "AIzaSyDcoyWu6Sq5_6v8G4j_pdiMyny4GiYIE8Q",
  authDomain: "direct-to-seller.firebaseapp.com",
  projectId: "direct-to-seller",
  storageBucket: "direct-to-seller.firebasestorage.app",
  messagingSenderId: "366400953836",
  appId: "1:366400953836:web:f7277877d7a58c3d95b4c9",
  measurementId: "G-55JR8KG1HF",
};

const fbApp = initializeApp(firebaseConfig);

export const db = getFirestore(fbApp);
export const auth = getAuth(fbApp);
export const googleProvider = new GoogleAuthProvider();
