// frontend/src/pages/Investments.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInv = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portfolio/investments');
      setInvestments(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInv(); }, []);

  return (
    <div className="min-h-screen p-6 bg-[#f8f6ef]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Investments</h1>
        <div className="bg-white p-4 rounded shadow">
          {loading ? <p>Loading...</p> : (
            <div className="space-y-3">
              {investments.length === 0 && <p className="text-gray-600">No investments yet</p>}
              {investments.map(i => (
                <div key={i._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-semibold">{i.assetId.symbol} • {i.type.toUpperCase()}</div>
                    <div className="text-sm text-gray-500">Qty: {i.quantity} • ₹ {i.price.toFixed(2)} • {new Date(i.executedAt).toLocaleString()}</div>
                  </div>
                  <div className="font-semibold">₹ {i.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
