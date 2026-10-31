import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthService, AuthUser } from './authService';

interface AuthContextValue {
  /** undefined はログイン状態の確認中 */
  user: AuthUser | null | undefined;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, service }: { children: ReactNode; service: AuthService }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => service.onChange(setUser), [service]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (email, password) => service.login(email, password),
      logout: () => service.logout(),
    }),
    [service, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth は AuthProvider の内側で使用してください');
  return value;
}
