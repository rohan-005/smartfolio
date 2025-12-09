/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { name, email, password, confirmPassword } = formData;
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (!name.trim()) return toast.error("Full name required");
    if (!email) return toast.error("Email required");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");
    if (password.length < 6)
      return toast.error("Min 6 characters required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const toastId = toast.loading("Creating account...");

    const result = await register(name, email, password);

    toast.dismiss(toastId);
    setLoading(false);

    if (!result.success)
      return toast.error(result.message || "Failed to register");

    toast.success("Verify your Email 📩");
    localStorage.setItem("pendingVerificationEmail", email);

    setTimeout(() => {
      navigate("/verify-email", { state: { email } });
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
          <h2 className="text-2xl font-bold text-[#222222]">
            Create Your Account
          </h2>
          <p className="text-sm text-[#222222]/70">
            Let's grow your wealth 📈
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            name="name"
            value={name}
            onChange={handleInput}
            placeholder="Full Name"
            className="w-full px-4 py-3 bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
          />

          <input
            name="email"
            type="email"
            value={email}
            onChange={handleInput}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
          />

          <input
            name="password"
            type="password"
            value={password}
            onChange={handleInput}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
          />

          <input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={handleInput}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] font-semibold rounded-lg shadow hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-[#222222]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#FF6D1F] font-semibold underline"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
