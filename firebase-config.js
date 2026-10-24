import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyXo9itMfng-5shpMw7xeRRWJhKxuQK1Y",
  authDomain: "insta-viral-mms4u.firebaseapp.com",
  projectId: "insta-viral-mms4u",
  storageBucket: "insta-viral-mms4u.firebasestorage.app",
  messagingSenderId: "106600783167",
  appId: "1:106600783167:web:6e5951a31bcb100e74c78a",
  measurementId: "G-FB2B01HG61"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
