/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Activity,
  Briefcase,
  Layers,
  User,
  LogOut,
  ChevronDown,
  Clock,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";

import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Sector
} from "recharts";

import logoImg from "../../assets/logo.png";

// Custom small tooltip (dark)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#222] p-3 border-2 border-[#FF6D1F]">
        <div className="text-xs text-[#F5E7C6] opacity-80">{label}</div>
        <div className="text-xl font-extrabold text-[#FF6D1F]">₹ {payload[0].value.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 24} textAnchor="middle" fill="#222" fontWeight="bold">{payload.name}</text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#FF6D1F" fontWeight="extrabold" fontSize={14}>
         {`₹${(value/1000).toFixed(1)}k`}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} stroke="#222" strokeWidth={1.5}/>
    </g>
  );
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [sparkData, setSparkData] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeIndexPie, setActiveIndexPie] = useState(0);
  const userMenuRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    function handle(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, iRes] = await Promise.all([api.get("/portfolio/me"), api.get("/portfolio/investments")]);
        setPortfolio(pRes.data);
        setInvestments(iRes.data.slice(0, 5));
        setSparkData([
          { name: "Mon", value: 90000 },
          { name: "Tue", value: 94000 },
          { name: "Wed", value: 97000 },
          { name: "Thu", value: 100400 },
          { name: "Fri", value: 104000 },
          { name: "Sat", value: 110200 },
          { name: "Sun", value: 116000 },
        ]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      }
    }
    load();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out");
  };

  if (!portfolio) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#beb88d] gap-4">
        <motion.img src={logoImg} alt="Loading" className="h-16 w-auto" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} />
      <div className="w-48 h-2 bg-[#222]/10 overflow-hidden">
          <motion.div className="h-full bg-[#FF6D1F]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} />
        </div>
      </div>
    );
  }

  // basic calculations
  const holdingsValue = portfolio.holdings.reduce((a, h) => a + (h?.quantity || 0) * (h?.avgPrice || 0), 0);
  const totalValue = holdingsValue + (portfolio.cashBalance || 0);

  const allocation = [
    { name: "Holdings", value: holdingsValue || 0 },
    { name: "Cash", value: portfolio.cashBalance || 0 },
  ];
  const COLORS = ["#FF6D1F", "#222222"];

  // UI card styles (neobrutal)
  const card = "bg-[#F5E7C6] border-2 border-[#222] shadow-[4px_4px_0_rgba(34,34,34,1)]";

  // Layout: single screen on large (no-scroll). On small, allow scroll.
  const headerHeight = 72;

  // Limit holdings/activities displayed
  const miniHoldings = portfolio.holdings.slice(0, 3);
  const miniInvest = investments.slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-[#beb88d] text-[#222] font-sans flex flex-col">
      {/* HEADER: fixed height */}
      <header className="h-[72px] flex items-center justify-between px-6 md:px-12" style={{ borderBottom: "2px solid rgba(34,34,34,0.06)" }}>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logoImg} alt="SmartFolio" className="h-10 w-auto object-contain" />
            <div className="hidden md:block font-bold text-lg">SmartFolio</div>
          </Link>

          {/* Nav Links (compact) */}
            <nav className="hidden md:flex items-center gap-4 font-bold text-sm uppercase tracking-wide">
            <Link to="/dashboard" className="px-3 py-2 hover:bg-[#F5E7C6]">Dashboard</Link>
            <a href="/assets" target="_blank" rel="noopener noreferrer" className="px-3 py-2 hover:bg-[#F5E7C6]">Assets ↗</a>
            <a href="/investments" target="_blank" rel="noopener noreferrer" className="px-3 py-2 hover:bg-[#F5E7C6]">Investments ↗</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#222] text-[#F5E7C6] border-2 border-transparent hover:border-[#FF6D1F]">
            <Wallet size={16} className="text-[#FF6D1F]" /> ₹ {portfolio.cashBalance.toFixed(0)}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setIsUserMenuOpen(s => !s)} className="flex items-center gap-2 bg-[#F5E7C6] border-2 border-[#222] px-3 py-2 font-bold">
              <User size={18} className="text-[#FF6D1F]" />
              <span className="hidden md:block">{user.name.split(" ")[0]}</span>
              <ChevronDown size={16} className={`${isUserMenuOpen ? "rotate-180" : ""} transition-transform`} />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 mt-2 w-48 bg-[#F5E7C6] border-2 border-[#222] shadow-[4px_4px_0_rgba(34,34,34,1)] overflow-hidden z-40">
                  <div className="p-3 border-b border-[#222]/10">
                    <div className="font-bold">{user.name}</div>
                    <div className="text-xs opacity-70 truncate">{user.email}</div>
                  </div>
                  <div className="flex flex-col py-1">
                    <Link to="/profile" className="px-4 py-3 text-sm hover:bg-[#beb88d]/30">Profile</Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-sm text-red-700 text-left hover:bg-red-100">Logout</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        className="flex-1 w-full"
        style={{
          height: `calc(100vh - ${headerHeight}px)`,
          overflow: "auto",
        }}
      >
        <div className="max-w-full mx-auto p-4 md:p-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

            {/* LEFT */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-auto">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div whileHover={{ y: -4 }} className={`${card} p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold uppercase opacity-70">Net Worth</div>
                      <div className="text-2xl md:text-3xl font-extrabold mt-2">₹ {Number(totalValue).toLocaleString()}</div>
                    </div>
                    <div className="bg-[#222] text-[#FF6D1F] p-2">
                      <Briefcase size={18} />
                    </div>
                  </div>
                  <div className="mt-2 text-sm opacity-70">Overview of assets & cash</div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className={`${card} p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold uppercase opacity-70">Invested</div>
                      <div className="text-2xl md:text-3xl font-extrabold mt-2">₹ {Number(holdingsValue).toLocaleString()}</div>
                    </div>
                    <div className="bg-[#222] text-[#FF6D1F] p-2">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="mt-2 text-sm opacity-70">Value held in assets</div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className={`${card} p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold uppercase opacity-70">Assets</div>
                      <div className="text-2xl md:text-3xl font-extrabold mt-2">{portfolio.holdings.length}</div>
                    </div>
                    <div className="bg-[#222] text-[#FF6D1F] p-2">
                      <Layers size={18} />
                    </div>
                  </div>
                  <div className="mt-2 text-sm opacity-70">Distinct holdings</div>
                </motion.div>
              </div>

              {/* Chart */}
              <motion.div className={`${card} p-4 mt-2`} style={{ minHeight: 300 }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-lg font-bold flex items-center gap-2"><Activity className="text-[#FF6D1F]" /> Portfolio Performance</div>
                    <div className="text-xs opacity-70">Last 7 days</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="bg-transparent border-2 border-[#222] px-3 py-1 text-sm">
                      <option>Week</option>
                      <option>Month</option>
                      <option>Year</option>
                    </select>
                    <button onClick={() => window.open('/assets','_blank')} className="px-3 py-1 border-2 border-[#222]">Browse</button>
                    <button onClick={() => window.open('/assets','_blank')} className="px-3 py-1 bg-[#FF6D1F] text-[#FAF3E1]">New</button>
                  </div>
                </div>

                <div style={{ height: 350 }} className="w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6D1F" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#FF6D1F" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12}/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis hide={true} domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF6D1F', strokeWidth: 2, strokeDasharray: '5 5' }} />
                      <Area type="monotone" dataKey="value" stroke="#FF6D1F" strokeWidth={3} fill="url(#g1)" activeDot={{ r: 6, stroke: '#222', strokeWidth: 2, fill: '#FF6D1F' }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Bottom mini row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Mini Holdings */}
                <motion.div className={`${card} p-4`} whileHover={{ y: -3 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold">Top Holdings</div>
                    <Link to="/investements" className="text-sm text-[#FF6D1F]">Manage ↗</Link>
                  </div>
                  <div className="space-y-2">
                    {miniHoldings.length === 0 ? (
                      <div className="text-sm opacity-70">No holdings yet.</div>
                    ) : (
                      miniHoldings.map(h => {
                        // handle deleted asset and missing fields
                        const asset = h.assetId || { symbol: "DELETED", name: "Deleted Asset", _id: `deleted-${h._id}` };
                        return (
                          <div key={asset._id || h._id} className="flex justify-between items-center">
                            <div>
                              <div className="font-bold">{asset.symbol}</div>
                              <div className="text-xs opacity-70">{asset.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold">₹ {(h.quantity * (h.avgPrice || 0)).toLocaleString()}</div>
                              <div className="text-xs opacity-70">{h.quantity} units</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>

                {/* Mini Activity */}
                <motion.div className={`${card} p-4`} whileHover={{ y: -3 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold">Recent Activity</div>
                    <Link to="/investments" className="text-sm text-[#FF6D1F]">History ↗</Link>
                  </div>

                  <div className="space-y-2">
                    {miniInvest.length === 0 ? (
                      <div className="text-sm opacity-70">No recent transactions.</div>
                    ) : (
                      miniInvest.map(i => (
                        <div key={i._id} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${i.type==='buy' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {i.type === 'buy' ? <ArrowUpRight size={14}/> : <TrendingUp size={14} />}
                            </div>
                            <div>
                              <div className="font-bold text-sm">{(i.assetId && i.assetId.symbol) ? i.assetId.symbol : 'DELETED'} <span className="text-xs opacity-70">{i.type.toUpperCase()}</span></div>
                              <div className="text-xs opacity-60 flex items-center gap-1"><Clock size={12}/> {new Date(i.executedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className={`font-extrabold ${i.type==='buy' ? 'text-red-700' : 'text-green-700'}`}>
                            {i.type === 'buy' ? '-' : '+'} ₹{i.total.toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="lg:col-span-4 flex flex-col gap-4 h-full">
              <motion.div className={`${card} p-4`} whileHover={{ y: -3 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold">Allocation</div>
                  <div className="text-s opacity-70">Snapshot</div>
                </div>
                <div className="flex items-center gap-3">
                  <div style={{ width: 120, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeIndexPie}
                          activeShape={renderActiveShape}
                          data={allocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={55}
                          paddingAngle={4}
                          dataKey="value"
                          onMouseEnter={(d,i) => setActiveIndexPie(i)}
                          stroke="#222"
                          strokeWidth={1}
                        >
                          {allocation.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1">
                    {allocation.map((a, i) => (
                      <div key={i} className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span style={{ width: 10, height: 10, background: COLORS[i] }} />
                          <div className="text-md">{a.name}</div>
                        </div>
                        <div className="font-semibold">{totalValue ? Math.round((a.value/totalValue)*100) : 0}%</div>
                      </div>
                    ))}
                    <div className="text-xs mt-2 opacity-70">Tip: diversify to manage risk.</div>
                  </div>
                </div>
              </motion.div>

              <motion.div className={`${card} p-4 flex-1 flex flex-col`} whileHover={{ y: -3 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold">Quick Actions</div>
                  <div className="text-s opacity-70">Shortcuts</div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <button onClick={() => window.open('/assets','_blank')} className="px-3 py-2 border-2 border-[#222] text-left">Browse Assets</button>
                  <button onClick={() => window.open('/investments','_blank')} className="px-3 py-2 bg-[#FF6D1F] text-[#FAF3E1]">New Investment</button>
                  {/* <button onClick={() => toast('Exported CSV (demo)')} className="px-3 py-2 border-2 border-[#222]">Export CSV</button> */}
                </div>

              </motion.div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
