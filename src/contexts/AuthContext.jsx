import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if Firebase is available
  if (!auth || !db) {
    return (
      <AuthContext.Provider value={{
        currentUser: null,
        userProfile: null,
        signup: () => Promise.reject(new Error('Firebase not configured')),
        login: () => Promise.reject(new Error('Firebase not configured')),
        logout: () => Promise.reject(new Error('Firebase not configured')),
        updateUserProfile: () => Promise.reject(new Error('Firebase not configured')),
        updateUserPassword: () => Promise.reject(new Error('Firebase not configured')),
        loading: false
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  async function signup(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(user, { displayName });
    
    // Create user profile in Firestore
    const userProfile = {
      id: user.uid,
      name: displayName,
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      friends: [],
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    setUserProfile(userProfile);
    
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function updateUserProfile(profileData) {
    if (!currentUser) throw new Error('No user logged in');
    
    // Update Firebase Auth profile if name changed
    if (profileData.name !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: profileData.name });
    }
    
    // Update Firestore document
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    
    // Update local state
    const updatedProfile = { ...userProfile, ...profileData };
    setUserProfile(updatedProfile);
    
    return updatedProfile;
  }

  async function updateUserPassword(currentPassword, newPassword) {
    if (!currentUser) throw new Error('No user logged in');
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    
    // Update password
    await updatePassword(currentUser, newPassword);
  }

  async function loadUserProfile(user) {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } else {
      setUserProfile(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await loadUserProfile(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    updateUserProfile,
    updateUserPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
