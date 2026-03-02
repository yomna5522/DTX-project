/**
 * Protects management (admin) routes. Redirects to /management/login if no admin session.
 * Uses dtx_admin_session from adminAuth; separate from customer ProtectedRoute.
 */

import { Navigate, useLocation } from "react-router-dom";
import { adminAuthApi } from "@/api/adminAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();
  const session = adminAuthApi.getSession();

  if (!session) {
    return <Navigate to="/management/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
