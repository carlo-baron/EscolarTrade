import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7pjo56VqPt1DrY3yEvhHLm-ZLT21gGAQ",
  authDomain: "escolar-trade.firebaseapp.com",
  projectId: "escolar-trade",
  storageBucket: "escolar-trade.firebasestorage.app",
  messagingSenderId: "287890627333",
  appId: "1:287890627333:web:06ecab30896a00c403356c",
  measurementId: "G-BVDZ6EQ2DQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
	db,
	auth,
};
