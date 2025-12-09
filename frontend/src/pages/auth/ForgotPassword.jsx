import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    resetToken: ""
  });
  const [loading, setLoading] = useState(false);

  const { email, otp, password, confirmPassword } = formData;
  const { 
    forgotPassword, 
    verifyPasswordResetOTP, 
    resetPassword, 
    resendPasswordResetOTP 
  } = useAuth();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Sending OTP...");

    try {
      const result = await forgotPassword(email);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || "OTP sent to your email!");
        setStep(2);
      } else {
        toast.error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error('Request failed:', error);
    }

    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying OTP...");

    try {
      const result = await verifyPasswordResetOTP(email, otp);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || "OTP verified successfully!");
        setFormData(prev => ({ 
          ...prev, 
          resetToken: result.resetToken 
        }));
        setStep(3);
      } else {
        toast.error(result.message || "Invalid OTP");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error('Request failed:', error);
    }

    setLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Resetting password...");

    try {
      const result = await resetPassword(formData.resetToken, password);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || "Password reset successfully! You can now login.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error('Request failed:', error);
    }

    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Resending OTP...");

    try {
      const result = await resendPasswordResetOTP(email);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || "OTP resent successfully!");
      } else {
        toast.error(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
      console.error('Request failed:', error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 p-8 hover:bg-gray-800/60 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src={logo}
                alt="ByteCode Logo"
                className="w-20 h-20 drop-shadow-2xl"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Reset Password
            </h2>
            <p className="text-gray-400">
              {step === 1 && "Enter your email to receive OTP"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Create your new password"}
            </p>
          </div>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="developer@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={onChange}
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-linear-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;