import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMVAgsvNJJBQyX-ldx0wVpF5XvEWmpPRU",
  authDomain: "secret-rudolph-game.firebaseapp.com",
  projectId: "secret-rudolph-game",
  storageBucket: "secret-rudolph-game.firebasestorage.app",
  messagingSenderId: "835114371128",
  appId: "1:835114371128:web:8b2c4da1b7ea4d0666becd",
  measurementId: "G-Z1L162D33N",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
