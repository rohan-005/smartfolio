const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  type: { type: String, default: "stock" }, // stock, crypto, etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Asset", assetSchema);
