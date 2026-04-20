import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_SuaChaveFalsaParaOCodigoNaoQuebrar",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seu-projeto",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seu-projeto.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn("Firebase não está configurado completamente no arquivo .env.local!");
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
