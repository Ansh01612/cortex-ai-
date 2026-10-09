// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
   authDomain: "cortex-a8e06.firebaseapp.com",
  projectId: "cortex-a8e06",
  storageBucket: "cortex-a8e06.firebasestorage.app",
  messagingSenderId: "860797912832",
  appId: "1:860797912832:web:00f48f78c3b7f3cee855e5",
  measurementId: "G-PWMGTRCRND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()