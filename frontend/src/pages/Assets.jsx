/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logoImg from "../assets/logo.png";
import { Search, PlusCircle, ArrowLeft, ChevronRight } from "lucide-react";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState(1);
  const { user } = useAuth();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/assets");
      setAssets(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const buy = async (s) => {
    try {
      await api.post("/portfolio/buy", { symbol: s, quantity: qty });
      toast.success("Bought successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Buy failed");
    }
  };

  const checkPrice = async (s) => {
    try {
      const res = await api.get(`/assets/price/${s}`);
      toast.success(`₹ ${res.data.price}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch price");
    }
  };

  const card = "bg-[#F5E7C6] border-2 border-[#222] rounded-2xl shadow-[4px_4px_0px_rgba(34,34,34,1)]";

  return (
    <div className="min-h-screen w-full bg-[#beb88d] text-[#222] font-sans">
      {/* HEADER */}
      <header className="h-[70px] px-6 flex items-center justify-between border-b-2 border-[#222]/10">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold hover:opacity-70">
          <ArrowLeft size={20} /> Back
        </Link>

        <div className="flex items-center gap-3">
          <img src={logoImg} className="h-10" alt="SmartFolio" />
          <span className="text-xl font-extrabold hidden sm:block">SmartFolio</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* SEARCH PRICE CARD */}
        <div className={`${card} p-6`}>
          <h1 className="font-extrabold text-2xl mb-4">Search Asset Price</h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-[#fff] rounded-xl border-2 border-[#222] px-3 py-2 w-full">
              <Search size={18} />
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter Symbol (AAPL, MSFT...)"
                className="w-full bg-transparent focus:outline-none font-semibold"
              />
            </div>

            <button
              onClick={() => checkPrice(symbol)}
              className="px-5 py-3 bg-[#FF6D1F] text-[#FAF3E1] font-bold rounded-xl border-2 border-[#222] hover:opacity-90"
            >
              Check
            </button>
          </div>

          <p className="text-sm opacity-70 mt-2">Instant live price lookup.</p>
        </div>

        {/* ASSET LIST */}
        <div className={`${card} p-6`}>
          <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
            Platform Assets <ChevronRight size={18} />
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-3">
              {assets.map((a) => (
                <motion.div
                  key={a._id}
                  whileHover={{ scale: 1.01 }}
                  className="flex justify-between items-center p-3 rounded-xl bg-[#beb88d]/20 border-2 border-transparent hover:border-[#FF6D1F] transition"
                >
                  <div>
                    <div className="text-lg font-extrabold">{a.symbol}</div>
                    <div className="text-sm opacity-70">{a.name}</div>
                    <div className="text-xs opacity-60">{a.assetClass}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-20 border-2 border-[#222] rounded-xl px-2 py-1 bg-white font-bold"
                    />

                    <button
                      onClick={() => buy(a.symbol)}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold border-2 border-[#222]"
                    >
                      Buy
                    </button>

                    <button
                      onClick={() => checkPrice(a.symbol)}
                      className="px-4 py-2 bg-[#F5E7C6] rounded-xl border-2 border-[#222] hover:bg-[#FF6D1F]/20"
                    >
                      Price
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ADD ASSET (ADMIN ONLY) */}
        <div className={`${card} p-6`}>
          <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
            Add Custom Asset <PlusCircle size={20} />
          </h2>

          {user?.role === "admin" ? (
            <AddAssetForm onAdded={fetchAssets} />
          ) : (
            <p className="opacity-70 text-sm">Only admins can add new assets.</p>
          )}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------
  ADMIN ADD ASSET FORM
------------------------------ */
function AddAssetForm({ onAdded }) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const submit = async () => {
    try {
      await api.post("/assets", {
        symbol: symbol.toUpperCase(),
        name,
        description: desc,
      });

      toast.success("Asset added!");
      setSymbol("");
      setName("");
      setDesc("");
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding asset");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <input
        className="border-2 border-[#222] p-3 rounded-xl bg-white font-bold"
        placeholder="Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <input
        className="border-2 border-[#222] p-3 rounded-xl bg-white font-bold"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border-2 border-[#222] p-3 rounded-xl bg-white font-bold"
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <div className="col-span-full flex justify-end">
        <button
          onClick={submit}
          className="px-5 py-3 bg-[#FF6D1F] text-[#FAF3E1] font-bold rounded-xl border-2 border-[#222] hover:opacity-90"
        >
          Add Asset
        </button>
      </div>
    </div>
  );
}
