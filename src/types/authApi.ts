/**
 * Auth API request/response DTOs — aligned with backend (accounts app, API_ENDPOINTS_FRONTEND.md).
 * Use for HTTP calls only; app state may use normalized types from types/auth.ts.
 */

/** User object as returned by login, profile, register (when included) */
export interface ApiUser {
  id: number;
  email: string;
  phone: string;
  fullname: string | null;
  avatar: string | null;
  address?: string | null;
  is_verified: boolean;
  is_admin: boolean;
  role: "admin" | "customer";
  created_at?: string;
}

/** POST /api/register/ — JSON or form-data */
export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
  fullname?: string;
  avatar?: File;
}

/** POST /api/register/ — 201 */
export interface RegisterResponse {
  id: number;
  email: string;
  phone: string;
  fullname: string | null;
  avatar: string | null;
  is_verified: boolean;
  is_admin: boolean;
  role: string;
  access: string;
  refresh: string;
  message: string;
}

/** POST /api/login/ */
export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

/** POST /api/login/ — 200 */
export interface LoginResponse {
  user: ApiUser;
  access: string;
  refresh: string;
}

/** POST /api/verify-otp/ */
export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

/** POST /api/verify-otp/ — 200 (normal) */
export interface VerifyOtpResponse {
  message: string;
}

/** POST /api/verify-otp/?forget=true — 200 */
export interface VerifyOtpForgetResponse {
  message: string;
  tokens: { access: string };
}

/** POST /api/resend_otp/ */
export interface ResendOtpRequest {
  phone: string;
}

/** POST /api/set-password/ */
export interface SetPasswordRequest {
  new_password: string;
  new_password_confirm: string;
}

/** POST /api/change-password/ */
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

/** GET /api/profile/ — 200. PATCH sends partial (fullname?, address?, avatar?) */
export type ProfileResponse = ApiUser;

/** POST /api/token/refresh/ — body */
export interface TokenRefreshRequest {
  refresh: string;
}

/** POST /api/token/refresh/ — 200 */
export interface TokenRefreshResponse {
  access: string;
}
