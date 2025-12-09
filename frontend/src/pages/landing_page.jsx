/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png'
const StockTicker = () => {
  const stocks = [
    { sym: "AAPL", val: "+1.2%", up: true },
    { sym: "BTC", val: "+5.4%", up: true },
    { sym: "TSLA", val: "-0.8%", up: false },
    { sym: "ETH", val: "+2.1%", up: true },
    { sym: "BTC", val: "+5.4%", up: true },
    { sym: "TSLA", val: "-0.8%", up: false },
    { sym: "ETH", val: "+2.1%", up: true },
    { sym: "NIFTY", val: "+0.5%", up: true },
    { sym: "GOLD", val: "+0.1%", up: true },
    { sym: "AMZN", val: "-1.2%", up: false },
    { sym: "ETH", val: "+2.1%", up: true },
    { sym: "NIFTY", val: "+0.5%", up: true },
    { sym: "GOLD", val: "+0.1%", up: true },
    { sym: "AMZN", val: "-1.2%", up: false },
  ];

  return (
    <div className="w-full overflow-hidden bg-[#F5E7C6] border-t border-[#222222] py-2 absolute bottom-0 z-20">
      <motion.div
        className="flex gap-8 whitespace-nowrap px-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...stocks, ...stocks].map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-xs md:text-sm font-mono tracking-tight"
          >
            <span className="font-semibold text-[#222222]">{s.sym}</span>
            <span className={s.up ? "text-[#FF6D1F]" : "text-[#222222]"}>
              {s.up ? "▲ " : "▼ "}
              {s.val}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const MockChart = () => (
  <svg viewBox="0 0 200 100" className="w-full h-24 mt-2 overflow-visible">
    {/* Grid Lines */}
    {[25, 50, 75].map((y, i) => (
      <line
        key={i}
        x1="0"
        y1={y}
        x2="200"
        y2={y}
        stroke="#F5E7C6"
        strokeWidth="1"
      />
    ))}

    {/* Line */}
    <motion.path
      d="M0,80 Q40,70 70,50 T120,35 T160,25 T200,15"
      fill="none"
      stroke="#FF6D1F"
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />

    {/* Dot */}
    <motion.circle
      cx="200"
      cy="15"
      r="4"
      fill="#FF6D1F"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ repeat: Infinity, duration: 1.8 }}
    />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const allocation = [
    { label: "Stocks", val: "54%" },
    { label: "Funds", val: "22%" },
    { label: "Cash", val: "16%" },
    { label: "Other", val: "8%" },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#beb88d] text-[#222222] overflow-hidden font-sans">
      {/* Background accent blobs using palette */}
      <motion.div
        className="absolute w-[340px] h-[340px] rounded-full"
        style={{ backgroundColor: "#F5E7C6" }}
        animate={{ x: mouse.x, y: mouse.y }}
        transition={{ type: "spring", stiffness: 40 }}
      />
      <div className="absolute -bottom-32 -right-32 w-[360px] h-[360px] rounded-full bg-[#F5E7C6]" />

      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full px-6 md:px-10 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="SmartFolio Logo"
            className="w-20 h-20 object-contain"
          />
          
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-1xl">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-md hover:bg-[#F5E7C6] transition-colors"
          >
            Login
          </button>
          {/* <button
            onClick={() => navigate("/admin/login")}
            className="px-4 py-2 rounded-md hover:bg-[#F5E7C6] transition-colors"
          >
            Admin
          </button> */}
          <button
            onClick={() => navigate("/admin/login")}
            className="px-4 md:px-5 py-2 rounded-md bg-[#FF6D1F] text-[#FAF3E1] font-semibold hover:opacity-90 transition-opacity"
          >
            Admin
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 md:gap-16 px-6 md:px-8">
        {/* Left: Copy */}
        <motion.div
          className="flex-1 text-center lg:text-left space-y-6 pt-16 lg:pt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
         
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#222222] bg-[#F5E7C6] text-2xl font-medium">
            <span> SmartFolio : Portfolio &amp; Wealth Dashboard</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            See your money
            <br />
            <span className="text-[#FF6D1F]">as a single picture.</span>
          </h1>

          <p className="text-sm md:text-base text-[#222222] max-w-md mx-auto lg:mx-0">
            SmartFolio brings your stocks, funds and cash into one clean
            dashboard — so you always know where you stand and what to do next.
          </p>

          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/register")}
              className="px-7 py-3 rounded-lg bg-[#FF6D1F] text-[#FAF3E1] font-semibold text-sm md:text-base"
            >
              Start Tracking
            </motion.button>
            
          </div>
        </motion.div>

        {/* Right: Card */}
        <motion.div
          className="flex-1 w-full max-w-sm bg-[#F5E7C6] border border-[#222222] rounded-3xl p-6 md:p-7"
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-medium">Total Portfolio</p>
              <p className="text-3xl md:text-4xl font-bold mt-1">$124,500</p>
            </div>
            <div className="px-2 py-1 rounded-md bg-[#FAF3E1] text-xs font-semibold text-[#FF6D1F]">
              ▲ +14.2%
            </div>
          </div>

          {/* Chart */}
          <MockChart />

          {/* Months */}
          <div className="flex justify-between text-[10px] mt-2 text-[#222222]">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
          </div>

          {/* Allocation */}
          <div className="mt-6 space-y-3">
            {allocation.map((a, i) => (
              <div
                key={i}
                className="flex justify-between text-xs md:text-sm gap-4"
              >
                <span>{a.label}</span>
                <span className="font-semibold">{a.val}</span>
              </div>
            ))}
          </div>

          {/* Tag Row */}
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] md:text-xs">
            {["Goal-based planning", "Risk overview", "Simple export"].map(
              (tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-full border border-[#222222]"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Ticker */}
      <StockTicker />
    </div>
  );
}
