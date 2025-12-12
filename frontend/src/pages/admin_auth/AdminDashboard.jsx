/* src/pages/admin_auth/AdminDashboard.jsx */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  Users,
  Database,
  CheckCircle,
  XCircle,
  Search
} from "lucide-react";

/**
 * SmartFolio themed Admin Dashboard (2 tabs: Users + Assets)
 * - Improved interactive AddAssetModal with:
 *   • suggestion list (keyboard + mouse)
 *   • animated dropdown, highlight, micro-interactions
 *   • live add/delete UX + loading states
 * - Keeps your neobrutal theme/colors/shadows
 */

/* styling helpers (keeps same theme look) */
const card =
  "bg-[#F5E7C6] border-2 border-[#222] shadow-[4px_4px_0_rgba(34,34,34,1)] p-4";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen p-6 bg-[#beb88d] text-[#222] font-sans">
      <div className="max-w-6xl mx-auto">
        {/* PAGE HEADER */}
        <h1 className="text-4xl font-extrabold mb-6 tracking-tight">SmartFolio Admin Dashboard</h1>

        {/* NAV TABS */}
        <div className="flex gap-4 border-b-2 border-[#222] pb-3 mb-6">
          {["users", "assets"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-bold text-md ${
                activeTab === tab ? "border-b-4 border-[#FF6D1F] text-[#FF6D1F]" : "opacity-70 hover:opacity-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "users" ? <span className="inline-flex items-center gap-2"><Users size={16}/> Users</span> : <span className="inline-flex items-center gap-2"><Database size={16}/> Assets</span>}
            </button>
          ))}
        </div>

        {/* PANELS */}
        <div className="mt-6">
          {activeTab === "users" && <UsersPanel />}
          {activeTab === "assets" && <AssetsPanel />}
        </div>
      </div>
    </div>
  );
}

/* ============================
   USERS PANEL
   ============================ */
function UsersPanel() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [blacklisted, setBlacklisted] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a, b] = await Promise.all([
        api.get("/admin/pending-users"),
        api.get("/admin/approved-users"),
        api.get("/admin/blacklisted-users"),
      ]);
      setPending(p.data || []);
      setApproved(a.data || []);
      setBlacklisted(b.data || []);
    } catch (err) {
      console.error("fetchData users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const approve = async (id) => {
    try {
      await api.put(`/admin/approve/${id}`);
      toast.success("User approved");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Approve failed");
    }
  };

  const blacklist = async (id) => {
    try {
      await api.put(`/admin/blacklist/${id}`);
      toast.error("User blacklisted");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Blacklist failed");
    }
  };

  const unblacklist = async (id) => {
    try {
      await api.put(`/admin/unblacklist/${id}`);
      toast.success("User removed from blacklist");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center p-8">
        <motion.div
          className="p-6 bg-[#F5E7C6] border-2 border-[#222]"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.0, repeat: Infinity }}
        >
          Loading users...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Pending Users" count={pending.length}>
        {pending.length === 0 ? (
          <EmptyHint text="No pending users" />
        ) : (
          pending.map((u) => (
            <UserBox key={u._id} user={u}>
              <OrangeBtn label={<><CheckCircle size={14}/> Approve</>} onClick={() => approve(u._id)} />
              <RedBtn label={<><XCircle size={14}/> Blacklist</>} onClick={() => blacklist(u._id)} />
            </UserBox>
          ))
        )}
      </Section>

      <Section title="Approved Users" count={approved.length}>
        {approved.length === 0 ? (
          <EmptyHint text="No approved users" />
        ) : (
          approved.map((u) => (
            <UserBox key={u._id} user={u}>
              <RedBtn label={<><XCircle size={14}/> Blacklist</>} onClick={() => blacklist(u._id)} />
            </UserBox>
          ))
        )}
      </Section>

      <Section title="Blacklisted Users" count={blacklisted.length}>
        {blacklisted.length === 0 ? (
          <EmptyHint text="No blacklisted users" />
        ) : (
          blacklisted.map((u) => (
            <UserBox key={u._id} user={u}>
              <GreenBtn label={<><CheckCircle size={14}/> Remove</>} onClick={() => unblacklist(u._id)} />
            </UserBox>
          ))
        )}
      </Section>
    </div>
  );
}

/* ============================
   ASSETS PANEL (with animated AddAssetModal)
   ============================ */
function AssetsPanel() {
  const [assets, setAssets] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/assets");
      setAssets(res.data || []);
    } catch (err) {
      console.error("fetchAssets:", err);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const removeAsset = async (id) => {
    try {
      await api.delete(`/assets/${id}`);
      toast.success("Asset deleted");
      fetchAssets();
    } catch (err) {
      console.error("removeAsset:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-extrabold text-xl">Platform Assets ({assets.length})</h2>
        <OrangeBtn label={<><PlusCircle size={14}/> Add Asset</>} onClick={() => setShowAdd(true)} />
      </div>

      {loading ? (
        <div className="p-6 bg-[#F5E7C6] border-2 border-[#222]">Loading assets...</div>
      ) : assets.length === 0 ? (
        <EmptyHint text="No assets in platform yet" />
      ) : (
        <div className="space-y-2">
          {assets.map((a) => (
            <div key={a._id} className={`${card} flex justify-between items-center`}>
              <div>
                <p className="font-bold">{a.symbol} — {a.name}</p>
                <p className="text-sm opacity-70">{a.assetClass || a.description || "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* <DarkBtn label={<><Search size={14}/> Price</>} onClick={async () => {
                  try {
                    const r = await api.get(`/assets/price/${a.symbol}`);
                    toast.success(`${a.symbol} — ₹ ${r.data.price}`);
                  } catch (err) {
                    console.error(err);
                    toast.error("Price fetch failed");
                  }
                }} /> */}
                <RedBtn label={<><Trash2 size={14}/> Delete</>} onClick={() => removeAsset(a._id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddAssetModal
            onClose={() => setShowAdd(false)}
            onAdded={() => {
              setShowAdd(false);
              fetchAssets();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================
   AddAssetModal (interactive + animated)
   ============================ */
function AddAssetModal({ onClose, onAdded }) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  // show suggestions dropdown
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Predefined suggestions list — keep this local but can later be dynamic
  const suggestions = [
    { symbol: "AAPL", name: "Apple Inc.", desc: "Technology — iPhone, Mac, iPad" },
    { symbol: "MSFT", name: "Microsoft Corp.", desc: "Technology — Windows, Azure" },
    { symbol: "TSLA", name: "Tesla Inc.", desc: "Electric vehicles & energy" },
    { symbol: "AMZN", name: "Amazon.com Inc.", desc: "E-commerce & cloud" },
    { symbol: "GOOGL", name: "Alphabet Inc.", desc: "Search, Ads & Cloud" },
    { symbol: "BTC", name: "Bitcoin", desc: "Cryptocurrency — BTC" },
    { symbol: "ETH", name: "Ethereum", desc: "Cryptocurrency — ETH" },
    { symbol: "NIFTY", name: "Nifty 50", desc: "Indian Index — NSE" },
    { symbol: "GOLD", name: "Gold Spot", desc: "Commodity — Gold (XAU)" },
  ];

  // filter suggestions by typed symbol or name
  const filtered = suggestions.filter((s) => {
    const q = (symbol || "").toLowerCase();
    return !q || s.symbol.toLowerCase().startsWith(q) || s.name.toLowerCase().includes(q);
  });

  // close on outside click or Esc
  useEffect(() => {
    function onDoc(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && filtered[activeIdx]) {
        pick(filtered[activeIdx]);
      }
    }
  };

  const pick = (s) => {
    setSymbol(s.symbol);
    setName(s.name);
    setDesc(s.desc);
    setShowSuggestions(false);
    setActiveIdx(-1);
    // focus next field (name)
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };

  const submit = async () => {
    if (!symbol || !name) {
      toast.error("Symbol & name are required");
      return;
    }
    try {
      setLoading(true);
      await api.post("/assets", { name, symbol, description: desc });
      toast.success("Asset added");
      onAdded && onAdded();
    } catch (err) {
      console.error("Add asset:", err);
      toast.error(err?.response?.data?.message || "Failed to add asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={containerRef}
        className={`${card} w-full max-w-md relative`}
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.98, y: 8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PlusCircle className="text-[#FF6D1F]" />
            <h3 className="text-xl font-bold">Add New Asset</h3>
          </div>
          <button onClick={() => onClose && onClose()} className="text-sm px-3 py-1 rounded hover:bg-[#222]/10">Close</button>
        </div>

        {/* SYMBOL INPUT with Animated Suggestions */}
        <div className="relative mb-3">
          <label className="text-xs font-bold opacity-70 uppercase">Symbol</label>
          <div className="mt-1 relative">
            <div className="flex items-center gap-2">
              <input
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase());
                  setShowSuggestions(true);
                  setActiveIdx(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. AAPL"
                className="ipt pr-10"
                autoComplete="off"
              />
              <div className="absolute right-3 top-2.5 opacity-60">
                <Search size={16} />
              </div>
            </div>

            {/* suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && filtered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-2 bg-[#F5E7C6] border-2 border-[#222] shadow-[4px_4px_0_rgba(34,34,34,1)] overflow-hidden z-40"
                >
                  {filtered.map((s, i) => (
                    <motion.div
                      key={s.symbol + i}
                      onMouseEnter={() => setActiveIdx(i)}
                      onMouseLeave={() => setActiveIdx(-1)}
                      onClick={() => pick(s)}
                      initial={false}
                      animate={{
                        background: activeIdx === i ? "rgba(34,34,34,0.06)" : "transparent",
                        scale: activeIdx === i ? 1.01 : 1,
                      }}
                      transition={{ duration: 0.12 }}
                      className="px-3 py-2 cursor-pointer border-b border-[#222]/10"
                    >
                      <div className="font-bold">{s.symbol} <span className="text-sm opacity-60 ml-2">{s.name}</span></div>
                      <div className="text-xs opacity-70">{s.desc}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* NAME */}
        <div className="mb-3">
          <label className="text-xs font-bold opacity-70 uppercase">Name</label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full company / asset name"
            className="ipt"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4">
          <label className="text-xs font-bold opacity-70 uppercase">Description</label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short description or asset class"
            className="ipt"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end items-center gap-3">
          <DarkBtn label="Cancel" onClick={() => onClose && onClose()} />
          <motion.div whileTap={{ scale: 0.98 }}>
            <OrangeBtn label={loading ? "Adding..." : "Add Asset"} onClick={submit} />
          </motion.div>
        </div>

        {/* micro-animation / hint bar */}
        <div className="mt-4 text-xs opacity-70 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FF6D1F]" /> Suggestions powered by local cache
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================
   small utilities & subcomponents
   ============================ */
function Section({ title, count, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-extrabold text-xl mb-2">{title} ({count})</h2>
      {children}
    </div>
  );
}

function UserBox({ user, children }) {
  return (
    <div className={`${card} flex justify-between items-center mb-2`}>
      <div>
        <p className="font-semibold">{user.name} • <span className="text-sm opacity-70">{user.email}</span></p>
        <div className="text-xs opacity-60 mt-1">{user.isBlacklisted ? "Blacklisted" : user.isAdmin ? "Admin" : "User"}</div>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function EmptyHint({ text }) {
  return <div className={`${card} text-sm opacity-70`}>{text}</div>;
}

/* ============================
   Buttons (theme consistent)
   ============================ */
function OrangeBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-[#FF6D1F] text-[#FAF3E1] font-bold border-2 border-[#222] shadow-[3px_3px_0_rgba(34,34,34,1)] hover:scale-[1.02] transition inline-flex items-center gap-2"
    >
      {typeof label === "string" ? label : label}
    </button>
  );
}

function RedBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-red-600 text-white font-bold border-2 border-[#222] shadow-[3px_3px_0_rgba(34,34,34,1)] inline-flex items-center gap-2"
    >
      {typeof label === "string" ? label : label}
    </button>
  );
}

function GreenBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-green-600 text-white font-bold border-2 border-[#222] shadow-[3px_3px_0_rgba(34,34,34,1)]"
    >
      {typeof label === "string" ? label : label}
    </button>
  );
}

function DarkBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-[#050505] text-[#F5E7C6] font-bold border-2 border-[#222] shadow-[3px_3px_0_rgba(34,34,34,1)] inline-flex items-center gap-2"
    >
      {typeof label === "string" ? label : label}
    </button>
  );
}

/* ============================
   Minimal input class (keeps with your ipt global)
   If you don't have ipt class defined in CSS, these styles give same look.
   ============================ */
export const _admin_dashboard_helpers = `
.ipt {
  width: 100%;
  border: 1px solid rgba(34,34,34,0.08);
  padding: 10px 12px;
  border-radius: 12px;
  background: white;
  outline: none;
  transition: box-shadow .15s, transform .06s;
}
.ipt:focus {
  box-shadow: 0 6px 0 rgba(255,109,31,0.08);
  transform: translateY(-1px);
  border-color: rgba(34,34,34,0.24);
}
`;

/* Note:
 - This file uses axios endpoints you already have: /admin/* and /assets
 - AddAssetModal uses a local suggestion list; you can later replace with remote suggestions
 - Keep your global CSS classes (ipt etc.) — a small helper style included above for reference
*/
