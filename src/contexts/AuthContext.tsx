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
import { setTokenProvider } from "@/api/tokenProvider";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirm?: string;
    phone?: string;
  }) => Promise<
    | { success: true }
    | { success: true; needsVerification: true; phone: string }
    | { success: false; error: string }
  >;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = authApi.getSession();
    setSession(stored);
    setTokenProvider({
      getAccessToken: () => authApi.getSession()?.token ?? null,
      getRefreshToken: () => authApi.getStoredRefreshToken(),
      setAccessToken: (access) => authApi.setAccessToken(access),
      onUnauthorized: () => {
        authApi.logout();
        setSession(null);
      },
    });
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const result = await authApi.login(identifier, password);
      if (result.success) {
        setSession(result.session);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    []
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      password_confirm?: string;
      phone?: string;
    }): Promise<
      | { success: true }
      | { success: true; needsVerification: true; phone: string }
      | { success: false; error: string }
    > => {
      const result = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm ?? data.password,
        phone: data.phone,
      });
      if (result.success && "session" in result) {
        setSession(result.session);
        return { success: true };
      }
      if (result.success && "needsVerification" in result) {
        return { success: true, needsVerification: true, phone: result.phone };
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
