import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const { forgotPassword, verifyPasswordResetOTP, resetPassword, resendPasswordResetOTP } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    resetToken: "",
    password: "",
    confirmPassword: "",
  });

  const { email, otp, password, confirmPassword } = formData;

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Step 1: Request OTP
  const requestOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email required");

    setLoading(true);
    const toastId = toast.loading("Sending OTP...");

    const result = await forgotPassword(email);
    toast.dismiss(toastId);
    setLoading(false);

    if (!result.success) return toast.error(result.message);
    toast.success("OTP sent to your email 📩");
    setStep(2);
  };

  // Step 2: Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");

    setLoading(true);
    const toastId = toast.loading("Verifying OTP...");

    const result = await verifyPasswordResetOTP(email, otp);
    toast.dismiss(toastId);
    setLoading(false);

    if (!result.success) return toast.error(result.message);
    toast.success("OTP Verified ✔");
    
    setFormData({ ...formData, resetToken: result.resetToken });
    setStep(3);
  };

  // Step 3: Reset Password
  const submitNewPassword = async (e) => {
    e.preventDefault();

    if (!password || password !== confirmPassword)
      return toast.error("Password mismatch");

    setLoading(true);
    const toastId = toast.loading("Updating password...");

    const result = await resetPassword(formData.resetToken, password);
    toast.dismiss(toastId);
    setLoading(false);

    if (!result.success) return toast.error(result.message);
    
    toast.success("Password Reset Successfully! 🎉");
    setTimeout(() => (window.location.href = "/login"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#beb88d] px-6">
      <div className="w-full max-w-md bg-[#F5E7C6] border border-[#222222] rounded-2xl p-8 shadow-lg">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <img src={logo} alt="SmartFolio" className="w-20 h-20 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-[#222222]">Reset Password</h2>
          <p className="text-sm text-[#222222]/70">
            {step === 1 && "Enter your registered email"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create a new password"}
          </p>
        </div>

        {/* STEP 1 — EMAIL */}
        {step === 1 && (
          <form onSubmit={requestOTP} className="space-y-5">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInput}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />

            <button
              disabled={loading}
              className="w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] font-semibold rounded-lg shadow hover:opacity-90 transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <form onSubmit={verifyOTP} className="space-y-5">
            <input
              name="otp"
              value={otp}
              onChange={handleInput}
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-3 text-center tracking-[0.5em] bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />

            <button
              disabled={loading}
              className="w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] rounded-lg font-semibold shadow hover:opacity-90 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => resendPasswordResetOTP(email)}
              className="w-full text-xs text-[#FF6D1F] underline"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* STEP 3 — NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={submitNewPassword} className="space-y-5">
            <input
              name="password"
              type="password"
              value={password}
              onChange={handleInput}
              placeholder="New Password"
              className="w-full px-4 py-3 bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />

            <input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleInput}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 bg-[#beb88d]/40 border border-[#222222] rounded-lg text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />

            <button
              disabled={loading}
              className="w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] font-semibold rounded-lg shadow hover:opacity-90 transition"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-6 text-center text-[#222222] text-sm">
          Remember password?{" "}
          <Link to="/login" className="text-[#FF6D1F] underline font-medium">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
