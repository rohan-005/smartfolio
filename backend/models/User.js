const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: false,
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },

    emailVerificationOTP: String,
    emailVerificationOTPExpire: Date,
    passwordResetOTP: String,
    passwordResetOTPExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Password middleware
// Use async middleware without the `next` argument and return early when
// the password hasn't changed. Mongoose treats async functions differently
// and won't pass a `next` callback, so declaring it caused `next` to be
// undefined in some environments.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Email verification OTP
userSchema.methods.generateEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  this.emailVerificationOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Password reset OTP method
userSchema.methods.generatePasswordResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");

  this.passwordResetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Clear password reset OTP
userSchema.methods.clearPasswordResetOTP = function () {
  this.passwordResetOTP = undefined;
  this.passwordResetOTPExpire = undefined;
};

// Password reset token (for link-based reset)
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
