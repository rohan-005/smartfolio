import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";
import axios from "axios";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ adminId: "", adminPass: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { adminId, adminPass } = formData;

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminId || !adminPass) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Signing in as Admin...");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      const response = await axios.post(`${API_URL}/admin/login`, {
        adminId,
        adminPass,
      });

      console.log("Admin login response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        // Store token & role
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role);

        toast.dismiss(toastId);
        toast.success("Admin login successful! 🎯");

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        toast.dismiss(toastId);
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Admin login error:", error.response?.data || error.message);
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#beb88d] px-6">
      <div
        className="w-full max-w-md bg-[#F5E7C6] border border-[#222222] p-8 shadow-lg"
        style={{ animation: "slideIn 0.3s ease-in-out" }}
      >
        <div className="text-center">
          <img src={logo} alt="SmartFolio" className="w-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#222222]">Admin Login</h2>
          <p className="text-sm text-[#222222]/70">Access SmartFolio Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-[#222222] font-medium">Admin ID</label>
            <input
              type="text"
              name="adminId"
              value={adminId}
              onChange={handleInput}
              placeholder="Enter admin ID"
              className="mt-1 w-full px-4 py-3 border border-[#222222] bg-[#beb88d]/40 text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />
          </div>

          <div>
            <label className="text-sm text-[#222222] font-medium">
              Admin Password
            </label>
            <input
              type="password"
              name="adminPass"
              value={adminPass}
              onChange={handleInput}
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-3 border border-[#222222] bg-[#beb88d]/40 text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] font-semibold shadow hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login as Admin"}
          </button>
        </form>

        <div className="mt-8 text-center text-[#222222]">
          Back to user login?{" "}
          <Link to="/login" className="text-[#FF6D1F] font-semibold underline">
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
