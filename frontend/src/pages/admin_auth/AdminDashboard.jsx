/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin_auth/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  
  return (
    <div className="min-h-screen p-6 bg-[#f8f6ef]">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold mb-6">SmartFolio Admin Dashboard</h1>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex gap-4 border-b mb-6 pb-3">
          <button className={tabBtn(activeTab === "users")} onClick={() => setActiveTab("users")}>Users</button>
          <button className={tabBtn(activeTab === "assets")} onClick={() => setActiveTab("assets")}>Assets</button>
          <button className={tabBtn(activeTab === "investments")} onClick={() => setActiveTab("investments")}>Investments</button>
          <button className={tabBtn(activeTab === "portfolios")} onClick={() => setActiveTab("portfolios")}>Portfolios</button>
        </div>

        {/* --- TAB PANELS --- */}
        {activeTab === "users" && <UsersPanel />}
        {activeTab === "assets" && <AssetsPanel />}
        {activeTab === "investments" && <InvestmentsPanel />}
        {activeTab === "portfolios" && <PortfolioPanel />}
      </div>
    </div>
  );
}

function tabBtn(active) {
  return `px-4 py-2 font-semibold ${active ? "border-b-2 border-black" : ""}`;
}

/////////////////////////////////////////////////////////////////////////////////////
// 🟦 USERS PANEL
/////////////////////////////////////////////////////////////////////////////////////
function UsersPanel() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [blacklisted, setBlacklisted] = useState([]);

  const fetchData = async () => {
    try {
      const p = await api.get("/admin/pending-users");
      const a = await api.get("/admin/approved-users");
      const b = await api.get("/admin/blacklisted-users");

      setPending(p.data);
      setApproved(a.data);
      setBlacklisted(b.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const approve = async (id) => {
    await api.put(`/admin/approve/${id}`);
    toast.success("User approved");
    fetchData();
  };

  const blacklist = async (id) => {
    await api.put(`/admin/blacklist/${id}`);
    toast.error("User blacklisted");
    fetchData();
  };

  const unblacklist = async (id) => {
    await api.put(`/admin/unblacklist/${id}`);
    toast.success("User removed from blacklist");
    fetchData();
  };

  return (
    <div>
      {/* Pending Users */}
      <Section title="Pending Users" count={pending.length}>
        {pending.map((u) => (
          <UserBox key={u._id} user={u}>
            <button className="btn-green" onClick={() => approve(u._id)}>Approve</button>
            <button className="btn-red" onClick={() => blacklist(u._id)}>Blacklist</button>
          </UserBox>
        ))}
      </Section>

      {/* Approved Users */}
      <Section title="Approved Users" count={approved.length}>
        {approved.map((u) => (
          <UserBox key={u._id} user={u}>
            <button className="btn-red" onClick={() => blacklist(u._id)}>Blacklist</button>
          </UserBox>
        ))}
      </Section>

      {/* Blacklisted */}
      <Section title="Blacklisted Users" count={blacklisted.length}>
        {blacklisted.map((u) => (
          <UserBox key={u._id} user={u}>
            <button className="btn-green" onClick={() => unblacklist(u._id)}>Remove</button>
          </UserBox>
        ))}
      </Section>
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////////////
// 🟦 ASSETS PANEL
/////////////////////////////////////////////////////////////////////////////////////
function AssetsPanel() {
  const [assets, setAssets] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await api.get("/assets");
      setAssets(res.data);
    } catch (err) { console.error(err); }
  };

  const removeAsset = async (id) => {
    await api.delete(`/assets/${id}`);
    toast.success("Asset removed");
    fetchAssets();
  };

  useEffect(() => { fetchAssets(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Platform Assets ({assets.length})</h2>
        <button className="btn-dark" onClick={() => setShowAdd(true)}>Add Asset</button>
      </div>

      {assets.map((a) => (
        <div key={a._id} className="flex justify-between items-center bg-white p-3 rounded shadow mb-2">
          <div>
            <p className="font-semibold">{a.symbol} — {a.name}</p>
            <p className="text-sm text-gray-500">{a.assetClass}</p>
          </div>
          <button className="btn-red" onClick={() => removeAsset(a._id)}>Delete</button>
        </div>
      ))}

      {showAdd && <AddAssetModal close={() => setShowAdd(false)} refresh={fetchAssets} />}
    </div>
  );
}

function AddAssetModal({ close, refresh }) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [desc, setDesc] = useState("");

  const submit = async () => {
    try {
      await api.post("/assets", { name, symbol, description: desc });
      toast.success("Asset added");
      refresh();
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding asset");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Add New Asset</h3>

        <input placeholder="Symbol" className="ipt" value={symbol} onChange={(e)=>setSymbol(e.target.value)} />
        <input placeholder="Name" className="ipt" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Description" className="ipt" value={desc} onChange={(e)=>setDesc(e.target.value)} />

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-gray" onClick={close}>Cancel</button>
          <button className="btn-dark" onClick={submit}>Add</button>
        </div>
      </div>
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////////////
// 🟦 INVESTMENTS PANEL
/////////////////////////////////////////////////////////////////////////////////////
function InvestmentsPanel() {
  const [investments, setInvestments] = useState([]);

  const fetchInv = async () => {
    try {
      const res = await api.get("/admin/investments");
      setInvestments(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchInv(); }, []);

  return (
    <Section title="All Investments" count={investments.length}>
      {investments.map((i) => (
        <div key={i._id} className="flex justify-between items-center bg-white p-3 rounded shadow mb-2">
          <div>
            <p className="font-semibold">
              {i.assetId?.symbol} — {i.type.toUpperCase()} by {i.userId?.email}
            </p>
            <p className="text-sm text-gray-500">
              Qty: {i.quantity} • Price: ₹{i.price} • {new Date(i.createdAt).toLocaleString()}
            </p>
          </div>
          <p className="font-bold">₹ {i.total.toFixed(2)}</p>
        </div>
      ))}
    </Section>
  );
}

/////////////////////////////////////////////////////////////////////////////////////
// 🟦 PORTFOLIO PANEL
/////////////////////////////////////////////////////////////////////////////////////
function PortfolioPanel() {
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selected, setSelected] = useState(null);
  const [portfolio, setPortfolio] = useState(null);

  const fetchUsers = async () => {
    const res = await api.get("/admin/approved-users");
    setUsers(res.data);
  };

  const viewPortfolio = async (id) => {
    const res = await api.get(`/portfolio/me`, { headers: { "X-USER-ID": id } });
    setPortfolio(res.data);
    setSelected(id);
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Portfolios</h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Users list */}
        <div className="col-span-1 bg-white rounded shadow p-3 h-[500px] overflow-auto">
          <h3 className="font-bold mb-2">Users</h3>
          {users.map((u) => (
            <div key={u._id} className="flex justify-between items-center border-b py-2">
              <p>{u.name}</p>
              <button className="btn-dark" onClick={() => viewPortfolio(u._id)}>View</button>
            </div>
          ))}
        </div>

        {/* Portfolio viewer */}
        <div className="col-span-2 bg-white rounded shadow p-4">
          {!portfolio ? (
            <p>Select a user</p>
          ) : (
            <>
              <h3 className="font-bold mb-3">Portfolio</h3>
              <p>Cash: ₹ {portfolio.cashBalance}</p>
              <h4 className="mt-4 font-semibold">Holdings</h4>
              {portfolio.holdings.length === 0 ? (
                <p>No holdings</p>
              ) : (
                portfolio.holdings.map((h) => (
                  <div key={h.assetId._id} className="border-b py-2 flex justify-between">
                    <p>{h.assetId.symbol} — Qty: {h.quantity}</p>
                    <p>Avg ₹ {h.avgPrice}</p>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////////////
// Small Reusable Components
/////////////////////////////////////////////////////////////////////////////////////
function Section({ title, count, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">{title} ({count})</h2>
      {children}
    </div>
  );
}

function UserBox({ user, children }) {
  return (
    <div className="flex justify-between items-center bg-white p-3 rounded shadow mb-2">
      <div>
        <p className="font-semibold">{user.name} • {user.email}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

// Button styles
const btnStyle = `
  px-3 py-1 rounded font-semibold text-white
`;

const btnClasses = {
  green: `${btnStyle} bg-green-600`,
  red: `${btnStyle} bg-red-600`,
  dark: `${btnStyle} bg-black`,
  gray: `${btnStyle} bg-gray-400 text-black`,
};

Object.assign(window, {
  "btn-green": btnClasses.green,
  "btn-red": btnClasses.red,
  "btn-dark": btnClasses.dark,
  "btn-gray": btnClasses.gray,
  ipt: "border p-2 rounded w-full mb-2",
});
