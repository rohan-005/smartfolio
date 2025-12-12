const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true }
});

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  holdings: [holdingSchema],
  cashBalance: { type: Number, default: 10000 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
