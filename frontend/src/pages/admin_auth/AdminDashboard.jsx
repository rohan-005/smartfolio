import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(response.data);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast.error("Failed to fetch pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is admin
    if (userRole !== "admin") {
      toast.error("Access denied! Not an admin");
      navigate("/dashboard");
      return;
    }

    fetchPendingUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, navigate, token, API_URL]);

  const approveUser = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User Approved ✓");
      fetchPendingUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const rejectUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User Rejected ✗");
      fetchPendingUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#beb88d]">
      {/* Admin Navbar */}
      <nav className="w-full bg-black text-white p-4 flex justify-between items-center shadow-lg">
        <h2 className="text-xl font-bold">SmartFolio Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-[#FF6D1F] px-4 py-2 rounded-lg text-black font-semibold hover:opacity-90"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-[#222222] mb-6">Pending User Approvals</h1>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-[#222222]">Loading pending users...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-[#222222] text-lg">No pending users 🎉</p>
            <p className="text-gray-600 text-sm mt-2">All users have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-[#222222] text-lg">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => approveUser(user._id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectUser(user._id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
