import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "vendor" | "supplier";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (requiredRole && currentUser.role !== requiredRole) {
    const redirectPath =
      currentUser.role === "vendor"
        ? "/vendor/dashboard"
        : "/supplier/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
