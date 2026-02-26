/**
 * Auth API — real backend integration. Uses shared client and authApi types.
 */

import { request, type ApiError } from "@/api/client";
import { AUTH_PATHS } from "@/api/constants";
import type {
  ApiUser,
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  TokenRefreshResponse,
  VerifyOtpResponse,
  VerifyOtpForgetResponse,
} from "@/types/authApi";
import type { User, Session } from "@/types/auth";

const STORAGE_KEY = "dtx_session";

function apiUserToUser(api: ApiUser): User {
  return {
    id: String(api.id),
    email: api.email,
    name: api.fullname ?? api.email,
    username: api.email,
    customerType: "EXISTING",
  };
}

interface StoredSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

function getStored(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function setStored(session: StoredSession | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function sessionFromStored(stored: StoredSession | null): Session | null {
  if (!stored) return null;
  return { user: stored.user, token: stored.accessToken };
}

export function getSession(): Session | null {
  return sessionFromStored(getStored());
}

/** Used by token provider to refresh; returns new access token only. */
export function getStoredRefreshToken(): string | null {
  return getStored()?.refreshToken ?? null;
}

/** Called by shared client after successful token refresh. */
export function setAccessToken(access: string): void {
  const stored = getStored();
  if (stored) {
    stored.accessToken = access;
    setStored(stored);
  }
}

function toErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as ApiError).message);
  }
  return "Request failed.";
}

export const authApi = {
  getSession,

  async login(
    identifier: string,
    password: string
  ): Promise<{ success: true; session: Session } | { success: false; error: string }> {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");
    const body: LoginRequest = {
      password,
      ...(isEmail ? { email: trimmed } : { phone: trimmed }),
    };
    if (!body.email && !body.phone) {
      return { success: false, error: "Please provide email or phone." };
    }
    try {
      const data = await request<LoginResponse>({
        method: "POST",
        path: AUTH_PATHS.login,
        body,
        skipAuth: true,
      });
      const user = apiUserToUser(data.user);
      const stored: StoredSession = {
        user,
        accessToken: data.access,
        refreshToken: data.refresh,
      };
      setStored(stored);
      return { success: true, session: { user, token: data.access } };
    } catch (err) {
      return { success: false, error: toErrorMessage(err) };
    }
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
    phone?: string;
  }): Promise<
    | { success: true; session: Session }
    | { success: true; needsVerification: true; phone: string }
    | { success: false; error: string }
  > {
    const password_confirm = data.password_confirm ?? data.password;
    if (data.password !== password_confirm) {
      return { success: false, error: "Passwords do not match." };
    }
    if (!data.phone?.trim()) {
      return { success: false, error: "Phone is required." };
    }
    try {
      const res = await request<RegisterResponse>({
        method: "POST",
        path: AUTH_PATHS.register,
        body: {
          email: data.email.trim(),
          phone: data.phone.trim(),
          password: data.password,
          password_confirm,
          fullname: data.name.trim() || undefined,
        },
        skipAuth: true,
      });
      if (!res.is_verified) {
        return { success: true, needsVerification: true, phone: res.phone };
      }
      const user = apiUserToUser(res);
      const stored: StoredSession = {
        user,
        accessToken: res.access,
        refreshToken: res.refresh,
      };
      setStored(stored);
      return { success: true, session: { user, token: res.access } };
    } catch (err) {
      const e = err as ApiError;
      if (e.details) {
        const first = Object.entries(e.details).map(([k, v]) => (v && v[0]) ? `${k}: ${v[0]}` : "").find(Boolean);
        return { success: false, error: first ?? e.message };
      }
      return { success: false, error: toErrorMessage(err) };
    }
  },

  async verifyOtp(phone: string, otp: string, forget = false): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const path = forget ? `${AUTH_PATHS.verifyOtp}?forget=true` : AUTH_PATHS.verifyOtp;
      const data = await request<VerifyOtpResponse | VerifyOtpForgetResponse>({
        method: "POST",
        path,
        body: { phone, otp },
        skipAuth: true,
      });
      if ("tokens" in data && data.tokens?.access) {
        const stored = getStored();
        if (stored) {
          stored.accessToken = data.tokens.access;
          setStored(stored);
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: toErrorMessage(err) };
    }
  },

  async resendOtp(phone: string, forget = false): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const path = forget ? `${AUTH_PATHS.resendOtp}?forget=true` : AUTH_PATHS.resendOtp;
      await request<{ message: string }>({
        method: "POST",
        path,
        body: { phone },
        skipAuth: true,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: toErrorMessage(err) };
    }
  },

  async setPassword(newPassword: string, newPasswordConfirm: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
      await request<{ message: string }>({
        method: "POST",
        path: AUTH_PATHS.setPassword,
        body: { new_password: newPassword, new_password_confirm: newPasswordConfirm },
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: toErrorMessage(err) };
    }
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      await request<{ message: string }>({
        method: "POST",
        path: AUTH_PATHS.changePassword,
        body: {
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm,
        },
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: toErrorMessage(err) };
    }
  },

  async getProfile(): Promise<ProfileResponse | null> {
    try {
      return await request<ProfileResponse>({ method: "GET", path: AUTH_PATHS.profile });
    } catch {
      return null;
    }
  },

  async updateProfile(updates: { fullname?: string; address?: string; avatar?: File }): Promise<{ success: true; user: User } | { success: false; error: string }> {
    try {
      if (updates.avatar) {
        const form = new FormData();
        if (updates.fullname !== undefined) form.set("fullname", updates.fullname);
        if (updates.address !== undefined) form.set("address", updates.address);
        form.set("avatar", updates.avatar);
        const data = await request<ProfileResponse>({
          method: "PATCH",
          path: AUTH_PATHS.profile,
          formData: form,
        });
        const stored = getStored();
        if (stored) {
          stored.user = apiUserToUser(data);
          setStored(stored);
        }
        return { success: true, user: apiUserToUser(data) };
      }
      const data = await request<ProfileResponse>({
        method: "PATCH",
        path: AUTH_PATHS.profile,
        body: {
          ...(updates.fullname !== undefined && { fullname: updates.fullname }),
          ...(updates.address !== undefined && { address: updates.address }),
        },
      });
      const stored = getStored();
      if (stored) {
        stored.user = apiUserToUser(data);
        setStored(stored);
      }
      return { success: true, user: apiUserToUser(data) };
    } catch (err) {
      return { success: false, error: toErrorMessage(err) };
    }
  },

  logout(): void {
    setStored(null);
  },

  /** Management / legacy: not provided by customer API; return empty so callers don’t break. */
  getUserById(_id: string): User | undefined {
    return undefined;
  },

  getAllUsers(): User[] {
    return [];
  },
};
