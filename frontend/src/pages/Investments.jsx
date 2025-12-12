/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

const card =
  "bg-[#F5E7C6] border-2 border-[#222] shadow-[4px_4px_0_rgba(34,34,34,1)] p-4";

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sellOpen, setSellOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/portfolio/investments");
      setInvestments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // -----------------------
  // OPEN SELL MODAL
  // -----------------------
  const openSell = (inv) => {
    if (!inv.assetId || inv.assetId.symbol === "DELETED") {
      toast.error("This asset has been deleted.");
      return;
    }

    setSelected(inv);
    setQty(1);
    setPrice("");
    setSellOpen(true);
  };

  // -----------------------
  // PERFORM SELL (CUSTOM PRICE)
  // -----------------------
  const performSell = async () => {
    try {
      if (!selected) return;

      if (!price || price <= 0) {
        toast.error("Enter a valid price");
        return;
      }
      if (qty <= 0) {
        toast.error("Quantity must be at least 1");
        return;
      }

      await api.post("/portfolio/sell", {
        symbol: selected.assetId.symbol,
        quantity: qty,
        price: Number(price),
      });

      toast.success("Sold successfully!");
      setSellOpen(false);
      setSelected(null);
      fetchInvestments();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Sell failed");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#beb88d] text-[#222] font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 tracking-tight">
          Investment History
        </h1>

        <div className={`${card}`}>
          {loading ? (
            <p>Loading...</p>
          ) : investments.length === 0 ? (
            <p className="opacity-70">No investments yet.</p>
          ) : (
            <div className="space-y-3">
              {investments.map((i) => {
                const deleted = !i.assetId || i.assetId.symbol === "DELETED";
                const symbol = deleted ? "DELETED" : i.assetId.symbol;
                const name = deleted ? "Removed Asset" : i.assetId.name;

                return (
                  <motion.div
                    key={i._id}
                    whileHover={{ y: -2 }}
                    className="flex justify-between items-center p-3 bg-[#FAF3E1] border-2 border-[#222] shadow-[2px_2px_0_rgba(34,34,34,1)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 ${
                          i.type === "buy"
                            ? "bg-green-200 text-green-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {i.type === "buy" ? (
                          <ArrowUpRight size={18} />
                        ) : (
                          <ArrowDownRight size={18} />
                        )}
                      </div>

                      <div>
                        <div className="font-bold">
                          {symbol}{" "}
                          <span className="text-xs opacity-60">
                            {i.type.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-xs opacity-70 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(i.executedAt).toLocaleString()}
                        </div>

                        <div className="text-xs opacity-60">{name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-extrabold ${
                          i.type === "buy" ? "text-red-700" : "text-green-700"
                        }`}
                      >
                        {i.type === "buy" ? "-" : "+"} ₹
                        {i.total.toLocaleString()}
                      </div>

                      {!deleted && (
                        <button
                          onClick={() => openSell(i)}
                          className="mt-1 text-sm px-3 py-1 bg-[#FF6D1F] text-[#FAF3E1] border-2 border-[#222] shadow-[2px_2px_0_rgba(34,34,34,1)]"
                        >
                          Sell
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* -----------------------
          SELL MODAL
      ------------------------ */}
      <AnimatePresence>
        {sellOpen && selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`${card} w-full max-w-md`}
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160 }}
            >
              <h3 className="text-xl font-extrabold mb-2">
                Sell {selected.assetId.symbol}
              </h3>

              {/* Quantity */}
              <label className="text-sm font-bold">Quantity</label>
              <input
                type="number"
                min={1}
                max={selected.quantity}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full border-2 border-[#222] p-2 bg-[#FAF3E1] mb-4"
              />

              {/* Custom Price */}
              <label className="text-sm font-bold">Price (your custom price)</label>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full border-2 border-[#222] p-2 bg-[#FAF3E1] mb-2"
              />

              {/* Total (preview) */}
              {price && qty > 0 && (
                <p className="font-bold text-[#FF6D1F] mb-4">
                  Total: ₹ {(qty * price).toLocaleString()}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-[#222] text-[#F5E7C6] border-2 border-[#222]"
                  onClick={() => setSellOpen(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-[#FF6D1F] text-[#FAF3E1] border-2 border-[#222]"
                  onClick={performSell}
                >
                  Confirm Sell
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
