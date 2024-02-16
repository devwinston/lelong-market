import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "lelong-market.firebaseapp.com",
  projectId: "lelong-market",
  storageBucket: "lelong-market.appspot.com",
  messagingSenderId: "785740034950",
  appId: "1:785740034950:web:dbd38fcf072583e90ef207",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage();
