// ✔ Fully updated Admin Dashboard UI
// ✔ Blacklisted users now appear inside Pending
// ✔ Shows “BLACKLISTED” badge
// ✔ Approve → Blacklist → Approve works perfectly

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`${API_URL}/admin/pending-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/approved-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPendingUsers(pendingRes.data);
      setApprovedUsers(approvedRes.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole !== "admin") {
      toast.error("Access denied");
      navigate("/");
      return;
    }

    fetchUsers();
  }, []);

  const approveUser = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User Approved!");
      fetchUsers();
    } catch {
      toast.error("Failed to approve user");
    }
  };

  const blacklistUser = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/blacklist/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User blacklisted");
      fetchUsers();
    } catch {
      toast.error("Failed to blacklist user");
    }
  };

  const rejectUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User Rejected");
      fetchUsers();
    } catch {
      toast.error("Failed to reject user");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#beb88d]">
      {/* NAVBAR */}
      <nav className="w-full bg-white/70 backdrop-blur-md border-b border-[#d6d0a8] p-4 flex justify-between items-center shadow-md">
        <h2 className="text-xl font-extrabold text-[#222222] tracking-wide">
          SmartFolio Admin Dashboard
        </h2>

        <button
          onClick={handleLogout}
          className="bg-[#FF6D1F] px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition"
        >
          Logout
        </button>
      </nav>

      {/* CONTENT */}
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-wide text-[#222222] mb-6">
          User Approval Center
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-lg font-semibold ${
              activeTab === "pending" ? "bg-black text-white" : "bg-white shadow"
            }`}
          >
            Pending Requests
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-2 rounded-lg font-semibold ${
              activeTab === "approved" ? "bg-black text-white" : "bg-white shadow"
            }`}
          >
            Approved Users
          </button>
        </div>

        {loading ? (
          <p className="text-center text-lg font-semibold">Loading...</p>
        ) : (
          <>
            {/* PENDING USERS (includes blacklisted) */}
            {activeTab === "pending" &&
              (pendingUsers.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center shadow">
                  <p className="font-semibold">No pending users 🎉</p>
                </div>
              ) : (
                pendingUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white p-6 mb-4 rounded-xl shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-bold flex items-center gap-2">
                        {user.name}
                        {user.isBlacklisted && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                            BLACKLISTED
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600">{user.email}</p>
                    </div>

                    <div className="flex gap-3">
                      {!user.isBlacklisted && (
                        <button
                          onClick={() => approveUser(user._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Approve
                        </button>
                      )}

                      {!user.isBlacklisted ? (
                        <button
                          onClick={() => rejectUser(user._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => approveUser(user._id)}
                          className="bg-black text-white px-4 py-2 rounded-lg"
                        >
                          Re-Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ))}

            {/* APPROVED USERS */}
            {activeTab === "approved" &&
              (approvedUsers.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center shadow">
                  <p className="font-semibold">No approved users yet</p>
                </div>
              ) : (
                approvedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white p-6 mb-4 rounded-xl shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-bold">{user.name}</p>
                      <p className="text-gray-600">{user.email}</p>
                    </div>

                    <button
                      onClick={() => blacklistUser(user._id)}
                      className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-800 transition"
                    >
                      Blacklist User
                    </button>
                  </div>
                ))
              ))}
          </>
        )}
      </div>
    </div>
  );
}
