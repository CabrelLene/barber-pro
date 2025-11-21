// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import type { AuthUser } from '../api/auth';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = (u: AuthUser, token: string) => {
    console.log('✅ AuthContext.login() appelé avec :', u.email);
    setUser(u);
    setAccessToken(token);
  };

  const logout = () => {
    console.log('🚪 AuthContext.logout()');
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
