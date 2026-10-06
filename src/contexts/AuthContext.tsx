import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.api';
import { storage } from '../utils/storage';
import type { AuthUser } from '../types/domain';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => storage.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!storage.getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        storage.setUser(me);
        setUser(me);
      } catch {
        storage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const { token } = await authApi.login({ email, password });
      storage.setToken(token);
      const me = await authApi.me();
      storage.setUser(me);
      setUser(me);
      return me;
    },
    logout() {
      storage.clear();
      setUser(null);
      window.location.assign('/login');
    },
    async refreshUser() {
      const me = await authApi.me();
      storage.setUser(me);
      setUser(me);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa de AuthProvider');
  return ctx;
}
