/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Place your logo in /src/assets/
// import Footer from '../components/Footer'

const whyByteCode = [
  { title: "Interactive Learning", description: "Practice coding while learning concepts, no passive reading.", icon: "💻" },
  { title: "Step-by-Step Courses", description: "Topics unlocked sequentially, building skills gradually.", icon: "📚" },
  { title: "Gamified Progress", description: "Earn XP, badges, and rewards while mastering coding.", icon: "🏆" },
  { title: "Expert-Verified Content", description: "Courses designed by experienced developers.", icon: "👨‍💼" },
];

const languages = [
  { title: "Frontend", description: "HTML, CSS, JavaScript, React", color: "from-blue-900 to-cyan-700" },
  { title: "Backend", description: "Node.js, Python, Java", color: "from-green-900 to-emerald-700" },
  { title: "Mobile", description: "React Native, Flutter", color: "from-purple-900 to-pink-700" },
  { title: "Database", description: "SQL, MongoDB, PostgreSQL", color: "from-orange-900 to-red-700" },
];

const features = [
  { title: "In-Site Coding Support", description: "Practice exercises and challenges directly in your browser.", gradient: "from-blue-500/20 to-cyan-500/20" },
  { title: "AI-Powered Assistance", description: "Get hints, explanations, and guided feedback without giving answers away.", gradient: "from-purple-500/20 to-pink-500/20" },
  { title: "Discussion & Collaboration", description: "Ask questions, pair program, and learn with peers in real-time rooms.", gradient: "from-green-500/20 to-emerald-500/20" },
  { title: "Gamified Progress", description: "Earn XP, unlock badges, and track your achievements as you progress.", gradient: "from-orange-500/20 to-red-500/20" },
  { title: "Reference Library", description: "Access official docs, cheat sheets, and curated tutorials per topic.", gradient: "from-indigo-500/20 to-purple-500/20" },
  { title: "Career Paths", description: "Structured learning paths for specific developer roles and goals.", gradient: "from-teal-500/20 to-blue-500/20" },
];

const LandingPage = () => {
  const [showContent, setShowContent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-gray-900 via-black to-gray-900 text-white px-4"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-80 h-80 bg-linear-to-r from-cyan-500/10 to-green-500/10 rounded-full blur-3xl"
          style={{
            right: `${mousePosition.x / 25}px`,
            bottom: `${mousePosition.y / 25}px`,
            transform: "translate(50%, 50%)",
          }}
        />
      </div>

      {/* Logo + App Name */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1, y: showContent ? 50 : 0 }}
        transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 z-10 py-20 font-transformer"
      >
        <motion.img
          src={logo}
          alt="ByteCode Logo"
          className="w-24 h-24 md:w-28 md:h-28 lg:w-40 lg:h-40 drop-shadow-2xl"
          initial={{ y: 30, opacity: 0, rotate: -180 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        />
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-amber-200"
        >
          ByteCode
        </motion.h1>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="flex flex-col items-center text-center max-w-6xl space-y-20 mt-20 z-10 "
          >
            {/* Hero Section */}
            <div className="space-y-6 py-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-pulse font-ice">
                Code-<span className="text-transparent bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text">Practice</span>-Master
              </h2>
              <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Transform how you learn to code with our interactive, gamified platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Why ByteCode Section */}
            <div className="w-full space-y-12">
              <h3 className="text-3xl font-bold text-white">
                Why <span className="text-transparent bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text">ByteCode</span>?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {whyByteCode.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.08, y: -8, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20"
                  >
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h4 className="text-xl font-semibold text-white mb-3">{item.title}</h4>
                    <p className="text-gray-300 leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Languages & Features Section */}
            <div className="w-full space-y-12">
              <h3 className="text-3xl font-bold text-white">
                Languages & <span className="text-transparent bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text">Frameworks</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {languages.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.08, y: -8, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`p-6 bg-linear-to-br ${item.color} rounded-2xl shadow-2xl text-white group cursor-pointer hover:shadow-xl`}
                  >
                    <h4 className="text-3xl font-bold mb-3">{item.title}</h4>
                    <p>{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="w-full space-y-12">
              <h3 className="text-3xl font-bold text-white">
                All-in-One <span className="text-transparent bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text">Learning Experience</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.08, y: -8, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`p-6 bg-linear-to-br ${item.gradient} backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20`}
                  >
                    <h4 className="text-xl font-semibold text-white mb-3">{item.title}</h4>
                    <p className="text-gray-200 leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        {/* <Footer/> */}
        </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
