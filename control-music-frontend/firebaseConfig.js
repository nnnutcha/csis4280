// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVi_YlgZu_MI_27CVnOpLw2zM9nBHydtE",
  authDomain: "fir-auth-d8d93.firebaseap.com",
  projectId: "fir-auth-d8d93",
  storageBucket: "fir-auth-d8d93.firebasestorage.app",
  messagingSenderId: "747952411468",
  appId: "1:747952411468:web:51d07906e2396a1e5bf5e9",
  measurementId: "G-8PZL6NGRFY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
