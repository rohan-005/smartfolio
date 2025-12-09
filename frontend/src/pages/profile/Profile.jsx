/* eslint-disable no-unused-vars */
// Profile.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
// import Footer from "../components/Footer";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bytecode-backend.vercel.app/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileForm.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        setMessage({ 
          type: "success", 
          text: "Profile updated successfully!" 
        });
      } else {
        setMessage({ 
          type: "error", 
          text: data.message || "Failed to update profile" 
        });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "An error occurred while updating profile" 
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ 
        type: "error", 
        text: "New passwords do not match" 
      });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ 
        type: "error", 
        text: "Password must be at least 6 characters" 
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://bytecode-backend.vercel.app/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "Password changed successfully!" 
        });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setMessage({ 
          type: "error", 
          text: data.message || "Failed to change password" 
        });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "An error occurred while changing password" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-purple-900/20 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-300 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          
          <div className="bg-linear-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 border border-gray-700">
            <h1 className="text-4xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your account information and security
            </p>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            message.type === "success" 
              ? "bg-green-500/20 border-green-500/50 text-green-300" 
              : "bg-red-500/20 border-red-500/50 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === "profile"
                      ? "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👤</span>
                    <span className="font-semibold">Profile Information</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === "password"
                      ? "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔒</span>
                    <span className="font-semibold">Change Password</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                
                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        className="w-full bg-gray-600 border border-gray-600 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-500 shadow-2xl hover:shadow-purple-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </button>

                    <Link
                      to="/dashboard"
                      className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                
                <form onSubmit={changePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter new password (min. 6 characters)"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Confirm your new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-500 shadow-2xl hover:shadow-purple-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Changing...
                        </div>
                      ) : (
                        "Change Password"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl font-semibold transition-all duration-300"
                    >
                      Back to Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full absolute bottom-0">
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Profile;