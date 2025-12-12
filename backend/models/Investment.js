const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio", required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  executedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Investment", investmentSchema);
