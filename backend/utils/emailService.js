// mailer.js
const nodemailer = require("nodemailer");

// CREATE TRANSPORTER
const createTransporter = () => {
  const cleanPassword = process.env.EMAIL_PASS
    ? process.env.EMAIL_PASS.trim()
    : "";

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword,
    },
  });
};

// SMARTFOLIO THEMING
const headerStyle = `
  background: #beb88d;
  color: #222222;
  padding: 20px;
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  border-bottom: 1px solid #222;
`;

const footerStyle = `
  font-size: 12px;
  color: #555;
  padding: 12px;
  text-align: center;
  margin-top: 20px;
`;

// -------------------------------------------------------------------
// 1️⃣ SEND OTP EMAIL (EMAIL VERIFICATION)
// -------------------------------------------------------------------
const sendOTPEmail = async (email, otp, name = "") => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "SmartFolio",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "SmartFolio — Email Verification Code",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F5E7C6;font-family:Arial;">
        
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;border:1px solid #222;overflow:hidden;">
          
          <div style="${headerStyle}">
            <h2 style="margin:0;font-size:22px;">SmartFolio</h2>
            <p style="margin:5px 0 0 0;font-size:14px;color:#333;">Secure Email Verification</p>
          </div>

          <div style="padding:25px;color:#222;">
            <p>Hello ${name || "there"},</p>
            <p>Please use the 6-digit OTP below to verify your SmartFolio account:</p>

            <div style="text-align:center;margin:25px 0;">
              <div style="display:inline-block;padding:18px 28px;font-size:32px;border-radius:10px;background:#beb88d;color:#222;font-weight:bold;letter-spacing:6px;border:1px solid #222;">
                ${otp}
              </div>
            </div>

            <p>This code is valid for <strong>10 minutes</strong>.</p>
            <p>If this wasn’t you, please ignore this email.</p>
          </div>

          <div style="${footerStyle}">
            © ${new Date().getFullYear()} SmartFolio. All rights reserved.
          </div>
        </div>
      
      </body>
      </html>
      `,
    };

    await transporter.verify();
    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("Mailer sendOTPEmail error:", error);
    return false;
  }
};

// -------------------------------------------------------------------
// 2️⃣ SEND PASSWORD RESET OTP EMAIL
// -------------------------------------------------------------------
const sendPasswordResetOTPEmail = async (email, otp, name = "") => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "SmartFolio",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "SmartFolio — Password Reset Code",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F5E7C6;font-family:Arial;">

        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;border:1px solid #222;overflow:hidden;">
          
          <div style="${headerStyle}">
            <h2 style="margin:0;font-size:22px;">SmartFolio</h2>
            <p style="margin:5px 0 0;font-size:14px;color:#333;">Password Reset Request</p>
          </div>

          <div style="padding:25px;color:#222;">
            <p>Hello ${name || "there"},</p>
            <p>Use the OTP below to reset your SmartFolio account password:</p>

            <div style="text-align:center;margin:25px 0;">
              <div style="display:inline-block;padding:18px 28px;font-size:32px;border-radius:10px;background:#F5E7C6;color:#222;font-weight:bold;letter-spacing:6px;border:1px solid #222;">
                ${otp}
              </div>
            </div>

            <p>This OTP will expire in <strong>10 minutes</strong>.</p>

            <div style="background:#fff4dd;border-left:4px solid #FF6D1F;padding:10px;margin-top:15px;border-radius:6px;">
              <strong>Note:</strong> If you did not request a password reset, please secure your account.
            </div>
          </div>

          <div style="${footerStyle}">
            © ${new Date().getFullYear()} SmartFolio. All rights reserved.
          </div>
        </div>

      </body>
      </html>
      `,
    };

    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Mailer sendPasswordResetOTPEmail error:", error);
    return false;
  }
};

// -------------------------------------------------------------------
// 3️⃣ SEND PASSWORD RESET LINK EMAIL
// -------------------------------------------------------------------
const sendPasswordResetEmail = async (email, resetToken, name = "") => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: {
        name: "SmartFolio",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "SmartFolio — Reset Your Password",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F5E7C6;font-family:Arial;">
        
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;border:1px solid #222;overflow:hidden;">
          
          <div style="${headerStyle}">
            <h2 style="margin:0;">SmartFolio</h2>
            <p style="margin:5px 0 0;font-size:14px;color:#333;">Reset your password</p>
          </div>

          <div style="padding:25px;color:#222;">
            <p>Hello ${name || "there"},</p>
            <p>Click the button below to reset your SmartFolio password. This link expires in <strong>1 hour</strong>.</p>

            <div style="text-align:center;margin:20px 0;">
              <a href="${resetUrl}" style="padding:12px 24px;background:#FF6D1F;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
                Reset Password
              </a>
            </div>

            <p>If you did not request this, please ignore the email.</p>
          </div>

          <div style="${footerStyle}">
            © ${new Date().getFullYear()} SmartFolio. All rights reserved.
          </div>

        </div>

      </body>
      </html>
      `,
    };

    await transporter.verify();
    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("Mailer sendPasswordResetEmail error:", error);
    return false;
  }
};

// -------------------------------------------------------------------
// 4️⃣ SEND ACCOUNT VERIFIED EMAIL (NEW)
// -------------------------------------------------------------------
const sendAccountVerifiedEmail = async (email, name = "") => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "SmartFolio",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "🎉 Your SmartFolio Account Has Been Verified!",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#F5E7C6;font-family:Arial;">

        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;border:1px solid #222;overflow:hidden;">
          
          <div style="${headerStyle}">
            <h2 style="margin:0;">SmartFolio</h2>
            <p style="margin:4px 0 0;font-size:14px;">Account Verified</p>
          </div>

          <div style="padding:25px;color:#222;">
            <h2 style="margin-top:0;">🎉 You're all set, ${name || "there"}!</h2>

            <p>Your SmartFolio account has been successfully <strong>verified and activated</strong>.
               You may now log in and access your dashboard, track investments, manage allocations, 
               and explore insights.</p>

            <div style="text-align:center;margin:25px 0;">
              <a href="${process.env.CLIENT_URL}/login"
                 style="padding:12px 24px;background:#FF6D1F;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
                Go to Dashboard
              </a>
            </div>

            <p>If you did not verify this account, please contact SmartFolio support immediately.</p>
          </div>

          <div style="${footerStyle}">
            © ${new Date().getFullYear()} SmartFolio. All rights reserved.
          </div>

        </div>

      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Mailer sendAccountVerifiedEmail error:", error);
    return false;
  }
};

// EXPORT ALL
module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendPasswordResetEmail,
  sendAccountVerifiedEmail, // NEW
};
