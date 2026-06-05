// Firebase client (browser-only). The apiKey is a publishable web key.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAzLpdZzemZSo8l2Yf2kmWV0ZTrl2bFMvo",
  authDomain: "earnspin-rewards-46c89.firebaseapp.com",
  projectId: "earnspin-rewards-46c89",
  storageBucket: "earnspin-rewards-46c89.firebasestorage.app",
  messagingSenderId: "1017145835153",
  appId: "1:1017145835153:web:5b885c023f0c6a99330930",
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } | null {
  if (typeof window === "undefined") return null;
  if (!_app) {
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
    _db = getFirestore(_app);
    _auth = getAuth(_app);
  }
  return { app: _app!, db: _db!, auth: _auth! };
}

export function db(): Firestore | null {
  return getFirebase()?.db ?? null;
}

export function auth(): Auth | null {
  return getFirebase()?.auth ?? null;
}
