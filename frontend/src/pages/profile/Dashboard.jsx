/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [investments, setInvestments] = useState([]);

  const loadPortfolio = async () => {
    try {
      const res = await api.get("/portfolio/me");
      setPortfolio(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load portfolio");
    }
  };

  const loadInvestments = async () => {
    try {
      const res = await api.get("/portfolio/investments");
      setInvestments(res.data.slice(0, 5)); // only 5 recent
    } catch (err) {}
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPortfolio();
    loadInvestments();
  }, []);

  if (!portfolio) return <div className="p-6">Loading...</div>;

  // Calculate approximate total value
  const holdingsValue = portfolio.holdings.reduce(
    (acc, h) => acc + h.quantity * h.avgPrice,
    0
  );

  const totalValue = holdingsValue + (portfolio.cashBalance || 0);

  return (
    <div className="min-h-screen p-6 bg-[#f8f6ef]">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* -------- USER INFO + PORTFOLIO SUMMARY -------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* USER INFO */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-2">User Information</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Status:</strong> {user.isBlacklisted ? "Blacklisted ❌" : "Active ✅"}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>

          {/* PORTFOLIO SUMMARY */}
          <div className="col-span-2 bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-2">Portfolio Overview</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryBox label="Total Value" value={`₹ ${totalValue.toFixed(2)}`} />
              <SummaryBox label="Cash Balance" value={`₹ ${portfolio.cashBalance}`} />
              <SummaryBox label="Holdings" value={`${portfolio.holdings.length} Assets`} />
              <SummaryBox label="Investments" value={`${investments.length} Recent`} />
            </div>
          </div>
        </div>

        {/* -------- NAVIGATION TABS -------- */}
        <div className="bg-white rounded shadow p-3 flex gap-6 text-lg font-semibold">
          <Link to="/dashboard" className="hover:underline">Portfolio</Link>
          <Link to="/assets" className="hover:underline">Assets</Link>
          <Link to="/investments" className="hover:underline">Investments</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
        </div>

        {/* -------- HOLDINGS PREVIEW -------- */}
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Your Holdings</h2>
            <Link to="/assets" className="text-blue-600 hover:underline">View All</Link>
          </div>

          {portfolio.holdings.length === 0 ? (
            <p>No assets in your portfolio yet.</p>
          ) : (
            <div className="space-y-2">
              {portfolio.holdings.slice(0, 5).map((h) => (
                <div key={h.assetId._id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-semibold">{h.assetId.symbol} — {h.assetId.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {h.quantity} • Avg Price: ₹{h.avgPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹ {(h.quantity * h.avgPrice).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* -------- RECENT INVESTMENTS -------- */}
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Recent Investments</h2>
            <Link to="/investments" className="text-blue-600 hover:underline">View All</Link>
          </div>

          {investments.length === 0 ? (
            <p>No recent transactions.</p>
          ) : (
            <div className="space-y-2">
              {investments.map((i) => (
                <div key={i._id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-semibold">
                      {i.assetId.symbol} — {i.type.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {i.quantity} • Price: ₹{i.price} • {new Date(i.executedAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold">₹ {i.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small reusable summary cards
function SummaryBox({ label, value }) {
  return (
    <div className="bg-gray-100 rounded p-3 text-center shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
