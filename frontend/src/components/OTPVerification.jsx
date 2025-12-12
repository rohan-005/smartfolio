/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/axiosConfig";
import logo from "../assets/logo.png";

/**
 * SMARTFOLIO THEME:
 * bg: #beb88d
 * card bg: #F5E7C6
 * text: #222222
 * accent: #FF6D1F
 */

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  useEffect(() => {
    const userEmail =
      location.state?.email ||
      localStorage.getItem("pendingVerificationEmail");

    if (!userEmail) {
      navigate("/register");
      return;
    }

    setEmail(userEmail);
    localStorage.setItem("pendingVerificationEmail", userEmail);
  }, [location, navigate]);

  // Countdown handler
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    if (value && !/^\d$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.every((d) => d !== "")) {
      handleVerifyOTP();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 0) return;

    const arr = paste.split("");
    setOtp([...arr, ...Array(6 - arr.length).fill("")]);

    if (arr.length === 6) inputRefs.current[5]?.focus();
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter the 6-digit code");

    setLoading(true);
    setError("");

    try {
      await api.post("/otp/verify-email", { email, otp: code });

      setMessage("Email verified successfully!");
      toast.success("🎉 Email verified!");

      localStorage.removeItem("pendingVerificationEmail");

      navigate("/under-verification");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to verify";
      toast.error(msg);
      setError(msg);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResendLoading(true);
    setError("");

    try {
      await api.post("/otp/resend-otp", { email });
      setMessage("OTP sent again!");
      toast.success("📨 New OTP sent!");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error("Could not resend");
      setError(err.response?.data?.message || "Failed to resend");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#beb88d] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Soft background blobs */}
  <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#F5E7C6] opacity-40 blur-2xl" />
  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#F5E7C6] opacity-30 blur-2xl" />

  <div className="relative w-full max-w-md bg-[#F5E7C6] border border-[#222222] p-8 shadow-xl z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src={logo} alt="SmartFolio" className="w-20 h-20" />
          </div>

          <h2 className="text-2xl font-bold text-[#222222]">
            Verify Your Email
          </h2>
          <p className="text-sm text-[#222222]/70 mt-1">
            Enter the 6-digit code sent to:
          </p>
          <p className="text-[#222222] font-semibold text-md break-all">
            {email}
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-4 p-3 border border-[#28a745] bg-[#d1f0d6] text-[#155724]">
            ✔ {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 border border-[#8b1e1e] bg-[#ffd7d7] text-[#7a0000]">
            ⚠ {error}
          </div>
        )}

        {/* OTP INPUT */}
        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={d}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleOtpChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-12 border border-[#222222] text-center text-lg font-semibold bg-white text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF6D1F]"
            />
          ))}
        </div>

        {/* VERIFY BUTTON */}
        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.join("").length !== 6}
          className="w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] font-semibold transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {/* RESEND */}
        <div className="text-center mt-4 text-sm text-[#222222]">
          Didn’t get the code? <br />
          <button
            disabled={resendLoading || countdown > 0}
            onClick={resendOTP}
            className="text-[#FF6D1F] font-semibold underline disabled:text-[#8f8f8f]"
          >
            {resendLoading
              ? "Sending..."
              : countdown > 0
              ? `Resend in ${countdown}s`
              : "Resend OTP"}
          </button>
        </div>

        {/* Back */}
        <div className="text-center mt-5">
          <button
            onClick={() => navigate("/register")}
            className="text-[#222222] underline"
          >
            ← Back to Register
          </button>
        </div>
      </div>
    </div>
  );
}
