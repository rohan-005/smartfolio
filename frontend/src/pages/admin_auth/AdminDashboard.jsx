/* eslint-disable */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const token = localStorage.getItem("token");
  
  const { getRole } = useAuth();
  const role = getRole();

  const fetchPending = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/admin/pending-users`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPendingUsers(res.data);
  };

  const approveUser = async (id) => {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/admin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("User Approved");
    fetchPending();
  };

  const rejectUser = async (id) => {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/admin/reject/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.error("User Rejected");
    fetchPending();
  };

  useEffect(() => {
    if (role !== "admin") {
      toast.error("Access denied! Not an admin");
      return (window.location.href = "/dashboard");
    }
    fetchPending();
  }, []);

  return (
    <div className="min-h-screen bg-[#beb88d]">
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>

        {pendingUsers.length === 0 ? (
          <p>No pending users 🎉</p>
        ) : (
          pendingUsers.map((user) => (
            <motion.div
              key={user._id}
              className="bg-white p-4 rounded-xl shadow-md mt-4 flex justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => approveUser(user._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectUser(user._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
