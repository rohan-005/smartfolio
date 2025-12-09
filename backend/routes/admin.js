const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Admin login endpoint
router.post("/login", async (req, res) => {
  try {
    const { adminId, adminPass } = req.body;

    // Validate input
    if (!adminId || !adminPass) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and password are required"
      });
    }

    // Check credentials against .env
    if (adminId === process.env.ADMIN_ID && adminPass === process.env.ADMIN_PASS) {
      // Generate admin token with role: admin
      const token = jwt.sign(
        { role: "admin", adminId },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      

      return res.json({
        success: true,
        message: "Admin login successful",
        user: {
          _id: "admin",
          name: "SmartFolio Admin",
          email: adminId,
          role: "admin",
          isVerified: true,
          isApprovedByAdmin: true,
        },
        token,
      });
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials"
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admin login"
    });
  }
});

// Get pending users for approval
router.get("/pending-users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({
      isVerified: true,
      isApprovedByAdmin: false,
    }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Error fetching pending users" });
  }
});

// Approve a user
router.put("/approve/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isApprovedByAdmin = true;
    await user.save();
    res.json({ success: true, message: "User approved" });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ success: false, message: "Error approving user" });
  }
});

// Reject/delete a user
router.delete("/reject/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User Rejected & Deleted" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ success: false, message: "Error rejecting user" });
  }
});

module.exports = router;
