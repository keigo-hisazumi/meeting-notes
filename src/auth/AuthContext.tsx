import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { LocalAuthService, type AuthService, type AuthUser } from './authService';

interface AuthContextValue {
  user: AuthUser | null;
  hasAccount: boolean;
  register(name: string, password: string): Promise<void>;
  login(name: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  service = new LocalAuthService(),
}: {
  children: ReactNode;
  service?: AuthService;
}) {
  const [authService] = useState(() => service);
  const [user, setUser] = useState<AuthUser | null>(() => authService.currentUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hasAccount: authService.hasAccount(),
      register: async (name, password) => setUser(await authService.register(name, password)),
      login: async (name, password) => setUser(await authService.login(name, password)),
      logout: async () => {
        await authService.logout();
        setUser(null);
      },
    }),
    [authService, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth は AuthProvider の内側で使用してください');
  return value;
}
