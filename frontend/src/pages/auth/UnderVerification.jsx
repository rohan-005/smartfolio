import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const UnderVerification = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-black to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 p-8">
          <div className="text-center mb-6">
            <img src={logo} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Account Under Review</h2>
            <p className="text-gray-400">Thanks for verifying your email. Your account is currently pending admin approval.</p>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-gray-300">An administrator will review your account shortly. You'll be able to access the dashboard once approved.</p>
            <p className="text-gray-400 text-sm">If this is taking too long, contact support or try logging in later.</p>

            <div className="pt-6">
              <Link to="/login" className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderVerification;
