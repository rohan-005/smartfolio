const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

/* ------------------------------------------
   ADMIN LOGIN
------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { adminId, adminPass } = req.body;

    if (!adminId || !adminPass) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and password are required",
      });
    }

    if (
      adminId === process.env.ADMIN_ID &&
      adminPass === process.env.ADMIN_PASS
    ) {
      const token = jwt.sign(
        { role: "admin", adminId },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.json({
        success: true,
        user: {
          _id: "admin",
          name: "SmartFolio Admin",
          email: adminId,
          role: "admin",
        },
        token,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------
   GET PENDING USERS
   Includes:
   • Verified but not approved yet
   • Blacklisted users (as requested)
------------------------------------------- */
router.get("/pending-users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({
      isVerified: true,
      isApprovedByAdmin: false, // includes blacklisted users now
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Error fetching pending:", error);
    res.status(500).json({ message: "Error fetching pending" });
  }
});

/* ------------------------------------------
   APPROVE A USER
------------------------------------------- */
router.put("/approve/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isApprovedByAdmin = true;
    user.isBlacklisted = false;
    user.approvedAt = new Date();

    await user.save();

    return res.json({ success: true, message: "User approved" });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Error approving user" });
  }
});

/* ------------------------------------------
   GET APPROVED USERS
------------------------------------------- */
router.get("/approved-users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({
      isApprovedByAdmin: true,
      isBlacklisted: false,
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Approved list error:", error);
    res.status(500).json({ message: "Error fetching approved users" });
  }
});

/* ------------------------------------------
   BLACKLIST APPROVED USER
   Moves them automatically back to pending list
------------------------------------------- */
router.put("/blacklist/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isBlacklisted = true;
    user.isApprovedByAdmin = false;

    await user.save();

    res.json({ success: true, message: "User has been blacklisted" });
  } catch (error) {
    console.error("Blacklist error:", error);
    res.status(500).json({ message: "Error blacklisting user" });
  }
});

/* ------------------------------------------
   REMOVE FROM BLACKLIST (OPTIONAL)
------------------------------------------- */
router.put("/unblacklist/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isBlacklisted = false;

    await user.save();

    res.json({ success: true, message: "User removed from blacklist" });
  } catch (error) {
    console.error("Unblacklist error:", error);
    res.status(500).json({ message: "Error removing blacklist" });
  }
});

/* ------------------------------------------
   GET BLACKLISTED USERS (Not required now but useful)
------------------------------------------- */
router.get("/blacklisted-users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({ isBlacklisted: true }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Blacklist fetch error:", error);
    res.status(500).json({ message: "Error fetching blacklisted users" });
  }
});

module.exports = router;
