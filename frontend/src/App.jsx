import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/landing_page";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OTPVerification from "./components/OTPVerification";
import Dashboard from "./pages/profile/Dashboard";
import UnderVerification from "./pages/auth/UnderVerification";

import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/profile/Profile";

import AdminDashboard from "./pages/admin_auth/AdminDashboard";
import AdminLogin from "./pages/admin_auth/AdminLogin";

import Assets from "./pages/Assets";
import Investments from "./pages/Investments";

import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* -------------------- PUBLIC ROUTES -------------------- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* -------------------- USER PROTECTED ROUTES -------------------- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAdminApproval={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assets"
              element={
                <ProtectedRoute requireAdminApproval={true}>
                  <Assets />
                </ProtectedRoute>
              }
            />

            <Route
              path="/investments"
              element={
                <ProtectedRoute requireAdminApproval={true}>
                  <Investments />
                </ProtectedRoute>
              }
            />

            <Route path="/under-verification" element={<UnderVerification />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* -------------------- ADMIN ROUTES -------------------- */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch All – Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#beb88d",
            color: "white",
            border: "1px solid #374151",
          },
          success: {
            style: {
              background: "#059669",
              color: "white",
            },
          },
          error: {
            style: {
              background: "#dc2626",
              color: "white",
            },
          },
          loading: {
            style: {
              background: "#1f2937",
              color: "white",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
