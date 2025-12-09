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
// import NotFound from "./pages/NotFound";
import "./App.css";
import { Toaster } from "react-hot-toast";
// import Courses from "./pages/Courses"; // Add this import
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from './pages/profile/Profile';
import AdminDashboard from "./pages/admin_auth/AdminDashboard";
// import CodeEditor from "./pages/CodeEditor";
// import CourseDetail from "./pages/CourseDetail";
// import ExerciseDetail from "./components/ExerciseDetail";
// import Devden from "./devden/devden";
// import Byteai from "./byteai/byteai";/


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<OTPVerification />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAdminApproval={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/under-verification"
              element={<UnderVerification />}
            />
            

            
            {/* forgot-password */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* profile update */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
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
