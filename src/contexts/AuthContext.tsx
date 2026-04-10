import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ADMIN_EMAIL = 'rethinkbharatofficial@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const normalizeEmail = (email?: string | null) => email?.toLowerCase().trim() ?? '';
    const isAdminEmail = (email?: string | null) => normalizeEmail(email) === ADMIN_EMAIL;
    let mounted = true;

    const resolveAdminStatus = async (currentUser: User) => {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data().role === 'admin';
      }

      const role = isAdminEmail(currentUser.email) ? 'admin' : 'user';
      await setDoc(userRef, {
        email: currentUser.email,
        role
      });
      return role === 'admin';
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const admin = await resolveAdminStatus(currentUser);
          if (mounted) setIsAdmin(admin);
        } catch (error) {
          console.error("Error checking admin status:", error);
          if (mounted) setIsAdmin(false);
        }
      } else {
        if (mounted) setIsAdmin(false);
      }
      
      if (mounted) setLoading(false);
    });

    (async () => {
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user && mounted) {
          setUser(redirectResult.user);
          const admin = await resolveAdminStatus(redirectResult.user);
          if (mounted) setIsAdmin(admin);
        }
      } catch (error) {
        console.error("Redirect login failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
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
