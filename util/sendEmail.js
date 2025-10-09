const nodemailer = require("nodemailer");
const { validateFields } = require("./validators");
require("dotenv").config();

const htmlelement = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OTP Verification For GC Portal</title>
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f4f7;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #eaeaea;
  }
  .header h1 {
    color: #333333;
    margin: 0;
  }
  .content {
    padding: 20px 0;
    text-align: center;
  }
  .otp {
    display: inline-block;
    background-color: #f1f5f9;
    color: #111827;
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 6px;
    padding: 15px 30px;
    border-radius: 8px;
    margin: 20px 0;
  }
  .note {
    font-size: 14px;
    color: #555555;
  }
  .footer {
    margin-top: 30px;
    font-size: 12px;
    color: #999999;
    text-align: center;
  }

  @media screen and (max-width: 480px) {
    .otp {
      font-size: 22px;
      padding: 12px 20px;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GC Portal</h1>
    </div>
    <div class="content">
      <p>Hi <strong>{{username}}</strong>,</p>
      <p>Use the following OTP to verify your email address. This OTP is valid for <strong>10 minutes</strong>.</p>
      <div class="otp">{{otp_code}}</div>
      <p class="note">If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">
      © 2025 GC Portal. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // 465 = SSL, 587 = TLS (starttls)
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});
const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `"GC Portal" <${process.env.EMAIL}>`, // sender address
      to: email, // list of receivers
      subject: "OTP for GC Portal Registration", // Subject line
      html: htmlelement
        .replace("{{otp_code}}", otp)
        .replace("{{username}}", email.split("@")[0].slice(4).toUpperCase()),
    });

    console.log("Message sent:", info.messageId);
    console.log("Server response:", info.response);
    return 1;
  } catch (err) {
    console.error("Error while sending mail", err);
    return 0;
  }
};

module.exports = sendOTPEmail;
