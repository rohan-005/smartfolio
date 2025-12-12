/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  ArrowLeft,
  Check,
  XCircle,
} from "lucide-react";
import logoImg from "../../assets/logo.png";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://bytecode-backend.vercel.app/api/auth/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: profileForm.name }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        updateUser(data.user);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else setMessage({ type: "error", text: data.message });

    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong." });
    }

    setLoading(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://bytecode-backend.vercel.app/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else setMessage({ type: "error", text: data.message });

    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong." });
    }

    setLoading(false);
  };

  const card = "bg-[#F5E7C6] border-2 border-[#222] shadow-[4px_4px_0_rgba(34,34,34,1)]";

  return (
    <div className="min-h-screen w-full bg-[#beb88d] text-[#222] font-sans">
      
      {/* HEADER */}
      <header className="h-[70px] px-6 flex items-center justify-between border-b-2 border-[#222]/10">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold hover:opacity-70">
          <ArrowLeft size={20} /> Back
        </Link>

        <div className="flex items-center gap-3">
          <img src={logoImg} className="h-10" alt="SmartFolio" />
          <span className="text-xl font-extrabold hidden sm:block">SmartFolio</span>
        </div>
      </header>

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">

        {/* SIDEBAR */}
        <aside className={`${card} p-6 h-fit sticky top-4`}>
          <div className="font-bold text-lg mb-4">Settings</div>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold border-2 border-[#222] mb-3 transition 
              ${activeTab === "profile" ? "bg-[#FF6D1F] text-[#FAF3E1]" : "bg-[#F5E7C6] hover:bg-[#FF6D1F]/20"}
            `}
          >
            <User size={18} /> Profile Info
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-bold border-2 border-[#222] transition 
              ${activeTab === "password" ? "bg-[#FF6D1F] text-[#FAF3E1]" : "bg-[#F5E7C6] hover:bg-[#FF6D1F]/20"}
            `}
          >
            <Lock size={18} /> Change Password
          </button>
        </aside>

        {/* MAIN SECTION */}
        <main className="lg:col-span-3 space-y-6">

          {/* ALERT */}
          {message.text && (
            <div
              className={`p-4 border-2 ${
                message.type === "success"
                  ? "bg-green-100 border-green-700 text-green-800"
                  : "bg-red-100 border-red-700 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className={`${card} p-6`}>
              <h1 className="text-2xl font-bold mb-4">Profile Information</h1>

              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label className="font-bold text-sm">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full mt-1 px-4 py-3 border-2 border-[#222] bg-[#F5E7C6]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-sm">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full mt-1 px-4 py-3 border-2 border-[#222]/40 bg-[#ddd] cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 font-bold bg-[#FF6D1F] text-[#FAF3E1] border-2 border-[#222] hover:opacity-90 transition"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div className={`${card} p-6`}>
              <h1 className="text-2xl font-bold mb-4">Change Password</h1>

              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="font-bold text-sm">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full mt-1 px-4 py-3 border-2 border-[#222] bg-[#F5E7C6]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-sm">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full mt-1 px-4 py-3 border-2 border-[#222] bg-[#F5E7C6]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-sm">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full mt-1 px-4 py-3 border-2 border-[#222] bg-[#F5E7C6]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 font-bold bg-[#FF6D1F] text-[#FAF3E1] border-2 border-[#222] hover:opacity-90 transition"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
