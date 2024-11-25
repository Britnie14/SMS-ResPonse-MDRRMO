import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDs4c6-R3u7yzm_dl5rzQJ1_Xkk5kTvuqg",
  authDomain: "sms-response-58493.firebaseapp.com",
  projectId: "sms-response-58493",
  storageBucket: "sms-response-58493.appspot.com",
  messagingSenderId: "534301049498",
  appId: "1:534301049498:web:f82132e65d659e516f1523"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

const storage  = getStorage(app);



export { db, auth, storage };
