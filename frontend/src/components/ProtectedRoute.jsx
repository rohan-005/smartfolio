import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({
  children,
  adminOnly = false,
  requireAdminApproval = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Not logged in at all
  if (!token) {
    return (
      <Navigate
        to={location.pathname.startsWith("/admin") ? "/admin/login" : "/login"}
        replace
      />
    );
  }

  // Role-based access control
  if (adminOnly) {
    if (role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    return children; // Admin authenticated
  }

  // User routes (non-admin)
  if (user) {
    // If user not approved by admin
    if (requireAdminApproval && user.isApprovedByAdmin === false) {
      return <Navigate to="/under-verification" replace />;
    }
    return children; // Normal Access
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
