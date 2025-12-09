/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Signing in...");

    const result = await login(email, password);
    toast.dismiss(toastId);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Login failed");
      return;
    }

    toast.success("Welcome back! 🎯");

    // Role-based navigation
    setTimeout(() => {
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (!result.user.isApprovedByAdmin) {
        navigate("/under-verification");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#beb88d] px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#F5E7C6] border border-[#222222] rounded-2xl p-8 shadow-lg"
      >
        <div className="text-center">
          <img src={logo} alt="SmartFolio" className="w-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#222222]">Welcome Back!</h2>
          <p className="text-sm text-[#222222]/70">Login to SmartFolio</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-[#222222] font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInput}
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-3 rounded-lg border border-[#222222] bg-[#beb88d]/40 text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />
          </div>

          <div>
            <label className="text-sm text-[#222222] font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleInput}
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-3 rounded-lg border border-[#222222] bg-[#beb88d]/40 text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] font-semibold rounded-lg shadow hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </motion.button>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-[#FF6D1F] text-sm font-medium underline"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="mt-8 text-center text-[#222222]">
          New here?{" "}
          <Link
            to="/register"
            className="text-[#FF6D1F] font-semibold underline"
          >
            Create Account
          </Link>
        </div>
        <div className="mt-8 text-center text-[#222222]">
          {" "}
          <Link
            to="/"
            className="text-[#FF6D1F] font-semibold underline"
          >
          &lt;-Back
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
