// frontend/src/pages/Assets.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState('');
  const [qty, setQty] = useState(1);
  const { user } = useAuth();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const buy = async (s) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await api.post('/portfolio/buy', { symbol: s, quantity: qty });
      toast.success('Bought successfully');
      // optionally refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Buy failed');
    }
  };

  const checkPrice = async (s) => {
    try {
      const res = await api.get(`/assets/price/${s}`);
      toast.success(`Price ${s}: ₹ ${res.data.price}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch price');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#f8f6ef]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Assets</h1>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex gap-2">
            <input value={symbol} onChange={e=>setSymbol(e.target.value)} placeholder="Symbol (e.g. AAPL, MSFT)" className="border p-2 rounded flex-1" />
            <button onClick={()=>checkPrice(symbol)} className="bg-black text-white px-4 rounded">Check Price</button>
          </div>
          <div className="text-sm text-gray-500 mt-2">Search above to fetch live price</div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">Platform Assets</h2>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-3">
              {assets.map(a => (
                <div key={a._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-semibold">{a.symbol} • {a.name}</div>
                    <div className="text-sm text-gray-500">{a.assetClass}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-20 border p-1 rounded" />
                    <button onClick={()=>buy(a.symbol)} className="bg-green-600 text-white px-3 py-1 rounded">Buy</button>
                    <button onClick={()=>checkPrice(a.symbol)} className="bg-gray-200 px-3 py-1 rounded">Price</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Add custom asset (admin only)</h2>
          {user?.role === 'admin' ? <AddAssetForm onAdded={fetchAssets} /> : <div className="text-sm text-gray-600">Only admins may add assets to the platform.</div>}
        </div>
      </div>
    </div>
  );
}

function AddAssetForm({ onAdded }) {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [desc, setDesc] = useState('');

  const submit = async () => {
    try {
      await api.post('/assets', { name, symbol, description: desc });
      toast.success('Asset added');
      setName(''); setSymbol(''); setDesc('');
      onAdded();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add asset');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <input className="col-span-1 border p-2 rounded" placeholder="Symbol" value={symbol} onChange={e=>setSymbol(e.target.value)} />
      <input className="col-span-1 border p-2 rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="col-span-1 border p-2 rounded" placeholder="Short desc" value={desc} onChange={e=>setDesc(e.target.value)} />
      <div className="col-span-3 flex justify-end">
        <button onClick={submit} className="bg-black text-white px-4 py-2 rounded mt-2">Add Asset</button>
      </div>
    </div>
  );
}
