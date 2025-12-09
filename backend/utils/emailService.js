const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  const cleanPassword = process.env.EMAIL_PASS?.replace(/\s/g, '') || '';
  
  console.log('🔧 Creating email transporter...');
  console.log('Email:', process.env.EMAIL_USER);
  console.log('Password length:', cleanPassword.length);

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword,
    },
  });
};

// Send OTP Email (for email verification)
const sendOTPEmail = async (email, otp, name) => {
  try {
    console.log('📧 Attempting to send OTP email to:', email);

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'ByteCode Auth',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Email Verification OTP - ByteCode',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 40px 20px;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #000000 0%, #333333 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .content {
                    padding: 40px 30px;
                    color: #333;
                }
                .otp-display {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 30px 0;
                    letter-spacing: 8px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
                .info-text {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 ByteCode Verification</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p class="info-text">Welcome to ByteCode! Use the verification code below to complete your registration:</p>
                    
                    <div class="otp-display">${otp}</div>
                    
                    <p class="info-text">
                        This code will expire in <strong>10 minutes</strong>.<br>
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 ByteCode. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.verify();
    console.log('✅ SMTP connection verified');

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

// Send Password Reset OTP Email
const sendPasswordResetOTPEmail = async (email, otp, name) => {
  try {
    console.log('📧 Attempting to send password reset OTP email to:', email);

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'ByteCode Auth',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Password Reset OTP - ByteCode',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 40px 20px;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .content {
                    padding: 40px 30px;
                    color: #333;
                }
                .otp-display {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 30px 0;
                    letter-spacing: 8px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
                .info-text {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .warning {
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 12px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 Password Reset - ByteCode</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p class="info-text">You requested to reset your password. Use the OTP code below to verify your identity:</p>
                    
                    <div class="otp-display">${otp}</div>
                    
                    <div class="warning">
                        <strong>Security Notice:</strong> This OTP will expire in <strong>10 minutes</strong>.
                        If you didn't request a password reset, please ignore this email and ensure your account is secure.
                    </div>
                    
                    <p class="info-text">
                        Enter this code in the password reset form to proceed with creating a new password.
                    </p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 ByteCode. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset OTP email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset OTP email:', error);
    return false;
  }
};

// Send Password Reset Email (for link-based reset - keeping for backward compatibility)
const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    console.log('📧 Attempting to send password reset email to:', email);

    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: {
        name: 'ByteCode Auth',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Password Reset Request - ByteCode',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #061e88 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666;">This link will expire in <strong>1 hour</strong>.</p>
            <p style="color: #666;">If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendPasswordResetEmail
};