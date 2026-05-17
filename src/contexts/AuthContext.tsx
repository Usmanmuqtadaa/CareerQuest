import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, getGoogleProvider, OperationType, handleFirestoreError, testConnection } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  createdAt: any;
  lastLogin: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdminVerified: boolean;
  selectedRole: 'user' | 'admin' | null;
  verifyAdminKey: (key: string) => boolean;
  selectRole: (role: 'user' | 'admin') => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | null>(() => {
    return sessionStorage.getItem('selected_role') as any || null;
  });
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_verified') === 'true';
  });

  const verifyAdminKey = (key: string) => {
    if (key === 'Horizon01') {
      setIsAdminVerified(true);
      sessionStorage.setItem('admin_verified', 'true');
      return true;
    }
    return false;
  };

  const selectRole = (role: 'user' | 'admin') => {
    setSelectedRole(role);
    sessionStorage.setItem('selected_role', role);
  };

  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = ['usman.muqtada1@gmail.com'];

  async function logActivity(action: string, details: string) {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'logs', `${Date.now()}_${auth.currentUser.uid}`), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error('Failed to log activity', e);
    }
  }

  useEffect(() => {
    // testConnection(); // Temporarily disabled to debug blank preview
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const userEmail = (user.email || '').toLowerCase();
          const isWhitelistedAdmin = ADMIN_EMAILS.includes(userEmail);

          if (!userSnap.exists()) {
            const role = isWhitelistedAdmin ? 'admin' : 'user';
            const newProfile: Partial<UserProfile> = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              role: role as any,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile as UserProfile);
            await logActivity('REGISTER', `New user registered with role ${role}`);
          } else {
            const data = userSnap.data() as UserProfile;
            
            // Auto-promote if email is in ADMIN_EMAILS but role is 'user'
            if (isWhitelistedAdmin && data.role !== 'admin') {
              console.log('Promoting user to admin');
              await setDoc(userRef, { role: 'admin' }, { merge: true });
              data.role = 'admin';
              await logActivity('ADMIN_PROMOTE', 'User automatically promoted via whitelist');
            }
            
            setProfile(data);
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
            await logActivity('LOGIN', 'User logged in');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, getGoogleProvider());
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Login popup closed by user');
        return;
      }
      console.error('Login failed', error);
      // Optional: You could set an error state here to show a toast/alert
    }
  };

  const logout = async () => {
    try {
      await logActivity('LOGOUT', 'User logged out');
      await signOut(auth);
      setProfile(null);
      setSelectedRole(null);
      setIsAdminVerified(false);
      sessionStorage.removeItem('selected_role');
      sessionStorage.removeItem('admin_verified');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdminVerified, 
      selectedRole,
      verifyAdminKey, 
      selectRole,
      login, 
      logout 
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
