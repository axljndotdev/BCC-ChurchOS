import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithUsername: (username: string, pass: string) => Promise<void>;
  signUpWithUsername: (username: string, pass: string, name: string) => Promise<void>;
  updateUserPassword: (newPass: string) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isCouncil: boolean;
  isMinistryLeader: boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    // Set persistence once on initialization
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Error setting auth persistence:', err);
    });

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Clean up previous profile listener
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser && db) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          
          // Set up real-time listener for profile
          unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
              setLoading(false);
            } else {
              // Create new profile if it doesn't exist
              const isSuperAdminUser = firebaseUser.email === 'wapdev24@gmail.com';
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || undefined,
                displayName: firebaseUser.displayName || 'Member',
                photoURL: firebaseUser.photoURL || '',
                role: isSuperAdminUser ? 'super_admin' : 'member',
                title: 'Member',
                status: isSuperAdminUser ? 'active' : 'pending',
                membershipStatus: isSuperAdminUser ? 'official_member' : 'visitor',
                isCouncilMember: isSuperAdminUser,
                createdAt: serverTimestamp(),
              };
              try {
                await setDoc(docRef, newProfile);
                // The onSnapshot will trigger again with the new data
              } catch (err) {
                console.error('Error creating profile:', err);
                setLoading(false);
              }
            }
          }, (error) => {
            console.error('Profile listener error:', error);
            setLoading(false);
          });
        } catch (error) {
          console.error('Error setting up profile listener:', error);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      alert('Firebase is not configured. Please add your API keys to the environment variables.');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const generateDummyEmail = (username: string) => {
    return `${username.toLowerCase().trim().replace(/\s+/g, '_')}@bcc.family`;
  };

  const signInWithUsername = async (username: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) return;
    try {
      const email = username.includes('@') ? username : generateDummyEmail(username);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      throw error;
    }
  };

  const signUpWithUsername = async (username: string, pass: string, name: string) => {
    if (!isFirebaseConfigured || !auth || !db) return;
    
    // Check if username is already taken (simulated by checking if UID exists or handle via Firestore later)
    // For now, we use unique dummy emails which Firebase enforces unique anyway
    const email = generateDummyEmail(username);
    
    try {
      const userRes = await createUserWithEmailAndPassword(auth, email, pass);
      
      const docRef = doc(db, 'users', userRes.user.uid);
      const isSuperAdminUser = email === 'wapdev24@gmail.com';
      const newProfile: UserProfile = {
        uid: userRes.user.uid,
        email: email,
        username: username,
        displayName: name || 'Member',
        photoURL: '',
        role: isSuperAdminUser ? 'super_admin' : 'member',
        title: 'Member',
        status: isSuperAdminUser ? 'active' : 'pending',
        membershipStatus: isSuperAdminUser ? 'official_member' : 'visitor',
        isCouncilMember: isSuperAdminUser,
        passwordChangeCount: 0,
        passwordChangeLocked: false,
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, newProfile);
    } catch (error) {
      throw error;
    }
  };

  const updateUserPassword = async (newPass: string) => {
    if (!auth || !auth.currentUser || !profile || !db) return;
    
    const count = profile.passwordChangeCount || 0;
    if (count >= 5 && profile.role !== 'super_admin') {
      throw new Error('Password change limit reached. Please contact Super Admin to reset.');
    }

    try {
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(auth.currentUser, newPass);
      
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, { 
        passwordChangeCount: count + 1,
        passwordChangeLocked: (count + 1) >= 5 && profile.role !== 'super_admin'
      }, { merge: true });
    } catch (error) {
      throw error;
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!profile || !db) return;
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, { ...details }, { merge: true });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  const isSuperAdmin = profile?.role === 'super_admin' || user?.email === 'wapdev24@gmail.com';
  const isAdmin = isSuperAdmin || profile?.role === 'church_admin';
  const isCouncil = profile?.isCouncilMember || isAdmin || ['Elder', 'Deacon', 'Deaconess', 'Pastor'].includes(profile?.title || '');
  const isMinistryLeader = profile?.role === 'ministry_leader' || isAdmin;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithGoogle, 
      signInWithUsername,
      signUpWithUsername,
      updateUserPassword,
      updateProfileDetails,
      signOut,
      isSuperAdmin,
      isAdmin,
      isCouncil,
      isMinistryLeader,
      isConfigured: isFirebaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
