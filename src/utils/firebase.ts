// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDg3BaMEoxS6tYmqDUWRMhyQcoMoby61js",
  authDomain: "sevakart-35a21.firebaseapp.com",
  projectId: "sevakart-35a21",
  storageBucket: "sevakart-35a21.firebasestorage.app",
  messagingSenderId: "810446553458",
  appId: "1:810446553458:web:2a06e494a0bcbb07c7ddeb",
  measurementId: "G-K9VVHB5X3V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { googleProvider };
