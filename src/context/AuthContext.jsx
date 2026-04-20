import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const docRef = doc(db, 'revendedores', user.uid);
        
        // Listen to document changes in real-time
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            setProfileData(null);
          }
        }, (err) => {
          console.error("Erro ao escutar dados do perfil no Firestore:", err);
        });
        
      } else {
        setProfileData(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, profileData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
