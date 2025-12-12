// backend/routes/assets.js
const express = require('express');
const Asset = require('../models/Asset');
const { protect, admin } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Public: list all assets
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json(assets);
  } catch (err) {
    console.error('List assets error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: search assets by symbol/name
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const results = await Asset.find({ $or: [{ symbol: regex }, { name: regex }] }).limit(20);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: get live price for a symbol (Yahoo query)
router.get('/price/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    const response = await axios.get(url);
    const result = response.data?.quoteResponse?.result?.[0];

    if (!result) return res.status(404).json({ message: 'Symbol not found' });

    const price = result.regularMarketPrice ?? result.postMarketPrice ?? result.preMarketPrice ?? null;

    res.json({
      symbol,
      price,
      raw: result,
    });
  } catch (err) {
    console.error('Price fetch error:', err.message || err);
    res.status(500).json({ message: 'Error fetching price' });
  }
});

// Admin: add an asset to platform catalog
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, symbol, assetClass, description } = req.body;
    if (!name || !symbol) return res.status(400).json({ message: 'Name and symbol required' });

    const exists = await Asset.findOne({ symbol: symbol.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Asset already exists' });

    const asset = await Asset.create({
      name,
      symbol: symbol.toUpperCase(),
      assetClass,
      description,
      addedBy: req.user._id === 'admin' ? undefined : req.user._id,
    });

    res.status(201).json({ asset });
  } catch (err) {
    console.error('Add asset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: remove asset
const Portfolio = require("../models/Portfolio");

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const assetId = req.params.id;

    const deleted = await Asset.findByIdAndDelete(assetId);
    if (!deleted) return res.status(404).json({ message: "Asset not found" });

    // Remove asset from all portfolios
    await Portfolio.updateMany(
      {},
      { $pull: { holdings: { assetId } } }
    );

    res.json({ message: "Asset removed everywhere" });
  } catch (err) {
    console.error("Delete asset error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
