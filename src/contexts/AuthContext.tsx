import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@/types/auth";
import { authApi } from "@/api/auth";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  register: (data: { name: string; email: string; password: string }) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = authApi.getSession();
    setSession(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback((identifier: string, password: string) => {
    const result = authApi.login(identifier, password);
    if (result.success) {
      setSession(result.session);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const register = useCallback(
    (data: { name: string; email: string; password: string }) => {
      const result = authApi.register(data);
      if (result.success) {
        setSession(result.session);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    []
  );

  const logout = useCallback(() => {
    authApi.logout();
    setSession(null);
  }, []);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
