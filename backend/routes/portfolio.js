// backend/routes/portfolio.js (FINAL UPDATED — uses FMP API instead of Yahoo)
const express = require("express");
const Portfolio = require("../models/Portfolio");
const Asset = require("../models/Asset");
const Investment = require("../models/Investment");
const { protect } = require("../middleware/auth");
const axios = require("axios");

const router = express.Router();


// ---------------- PRICE FETCH (FMP API) ----------------
async function fetchPriceSymbol(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_API_KEY}`;
    const resp = await axios.get(url, { timeout: 5000 });

    const data = resp.data["Global Quote"];

    if (!data || !data["05. price"]) {
      console.error("Alpha price missing:", symbol, resp.data);
      return null;
    }

    return {
      price: parseFloat(data["05. price"]),
      symbol,
    };
  } catch (err) {
    console.error("AlphaVantage Price Fetch Error:", err.message);
    return null;
  }
}


// ---------------- GET USER PORTFOLIO ----------------
router.get("/me", protect, async (req, res) => {
  try {
    let p = await Portfolio.findOne({ userId: req.user._id }).populate(
      "holdings.assetId"
    );

    if (!p) {
      p = await Portfolio.create({
        userId: req.user._id,
        holdings: [],
        cashBalance: 10000, // demo balance
      });

      p = await Portfolio.findById(p._id).populate("holdings.assetId");
    }

    res.json(p);
  } catch (err) {
    console.error("Get portfolio error:", err);
    res.status(500).json({ message: "Server error fetching portfolio" });
  }
});


// ---------------- BUY ASSET ----------------
router.post("/buy", protect, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid symbol or quantity" });
    }

    const asset = await Asset.findOne({ symbol: symbol.toUpperCase() });
    if (!asset) {
      return res
        .status(404)
        .json({ message: `Asset ${symbol.toUpperCase()} not found in catalog` });
    }

    const priceData = await fetchPriceSymbol(asset.symbol);
    if (!priceData || !priceData.price) {
      return res.status(400).json({ message: "Unable to fetch live price" });
    }

    const price = priceData.price;
    const totalCost = price * quantity;

    // Get or create portfolio
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: req.user._id,
        holdings: [],
        cashBalance: 10000,
      });
    }

    if (portfolio.cashBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update holdings
    const existing = portfolio.holdings.find(
      (h) => String(h.assetId) === String(asset._id)
    );

    if (existing) {
      const newQty = existing.quantity + quantity;
      const newAvg =
        (existing.avgPrice * existing.quantity + price * quantity) / newQty;

      existing.quantity = newQty;
      existing.avgPrice = newAvg;
    } else {
      portfolio.holdings.push({
        assetId: asset._id,
        quantity,
        avgPrice: price,
      });
    }

    portfolio.cashBalance -= totalCost;
    await portfolio.save();

    const inv = await Investment.create({
      userId: req.user._id,
      portfolioId: portfolio._id,
      assetId: asset._id,
      type: "buy",
      quantity,
      price,
      total: totalCost,
    });

    await portfolio.populate("holdings.assetId");

    res.json({ portfolio, investment: inv });
  } catch (err) {
    console.error("Buy error:", err);
    res.status(500).json({ message: "Server error during buy" });
  }
});


// ---------------- SELL ASSET ----------------
router.post("/sell", protect, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid symbol or quantity" });
    }

    const asset = await Asset.findOne({ symbol: symbol.toUpperCase() });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    const priceData = await fetchPriceSymbol(asset.symbol);
    if (!priceData || !priceData.price) {
      return res.status(400).json({ message: "Unable to fetch live price" });
    }

    const price = priceData.price;

    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      return res
        .status(400)
        .json({ message: "Portfolio does not exist or is empty" });
    }

    const holding = portfolio.holdings.find(
      (h) => String(h.assetId) === String(asset._id)
    );

    if (!holding || holding.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough quantity available to sell" });
    }

    const totalProceeds = price * quantity;

    holding.quantity -= quantity;
    if (holding.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter(
        (h) => String(h.assetId) !== String(asset._id)
      );
    }

    portfolio.cashBalance += totalProceeds;
    await portfolio.save();

    const inv = await Investment.create({
      userId: req.user._id,
      portfolioId: portfolio._id,
      assetId: asset._id,
      type: "sell",
      quantity,
      price,
      total: totalProceeds,
    });

    await portfolio.populate("holdings.assetId");

    res.json({ portfolio, investment: inv });
  } catch (err) {
    console.error("Sell error:", err);
    res.status(500).json({ message: "Server error during sell" });
  }
});


// ---------------- GET INVESTMENTS ----------------
router.get("/investments", protect, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id })
      .populate("assetId")
      .sort({ executedAt: -1 });

    res.json(investments);
  } catch (err) {
    console.error("Get investments error:", err);
    res.status(500).json({ message: "Failed to fetch investments" });
  }
});


module.exports = router;
