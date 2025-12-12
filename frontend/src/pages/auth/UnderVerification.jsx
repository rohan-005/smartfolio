import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function UnderVerification() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#beb88d] px-6">
  <div className="max-w-md w-full bg-[#F5E7C6] border border-[#222222] p-8 shadow-lg text-center">
        
        {/* Logo */}
        <img src={logo} alt="SmartFolio" className="w-20 h-20 mx-auto mb-4" />
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-[#222222] mb-2">
          Account Under Review
        </h2>

        {/* Subtitle */}
        <p className="text-[#222222]/80 text-sm mb-6">
          Thanks for verifying your email!  
          Your account is currently pending admin approval.
        </p>

        {/* Info Message */}
        <div className="text-xs text-[#222222]/70 leading-relaxed mb-8">
          You’ll gain full access once your account is approved.  
          Please check back later or contact support if needed.
        </div>

        {/* Back to Login Button */}
        <Link 
          to="/login"
          className="inline-block w-full py-3 bg-[#FF6D1F] text-[#FAF3E1] font-semibold shadow hover:opacity-90 transition"
        >
          Back to Login
        </Link>

        {/* Footer Note */}
        <p className="mt-6 text-xs text-[#222222]/70">
          SmartFolio protects customer safety & identity 🌐
        </p>

      </div>
    </div>
  );
}
