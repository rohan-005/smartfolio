const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Admin login (checks .env credentials, not DB)
router.post("/login", async (req, res) => {
  const { adminId, adminPass } = req.body;

  // Admin login using .env credentials
  if (email === process.env.ADMIN_ID && password === process.env.ADMIN_PASS) {
    return res.json({
      success: true,
      message: "Admin login successful",
      user: {
        name: "SmartFolio Admin",
        email,
        role: "admin",
        isVerified: true,
        isApprovedByAdmin: true,
      },
      token: generateToken("admin"), // Not linked to DB user ID
    });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid admin credentials" });
});

// Get pending users for approval
router.get("/pending-users", protect, admin, async (req, res) => {
  const users = await User.find({
    isVerified: true,
    isApprovedByAdmin: false,
  }).select("-password");
  res.json(users);
});

// Approve a user
router.put("/approve/:id", protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isApprovedByAdmin = true;
  await user.save();
  res.json({ message: "User approved", success: true });
});

// Reject/delete a user
router.delete("/reject/:id", protect, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User Rejected & Deleted", success: true });
});

module.exports = router;
