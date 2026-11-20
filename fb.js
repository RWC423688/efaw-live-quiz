// Firebase setup shared by the candidate and trainer pages.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

export const configured = !!firebaseConfig.projectId && !String(firebaseConfig.projectId).startsWith("PASTE");
const app = configured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export { signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut,
         doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where };
