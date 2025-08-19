// routes/auth.js
import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();

// you will set JWT_SECRET in .env
const JWT_SECRET = process.env.JWT_SECRET;

// 📩 Email transporter (can start with Gmail or a service like SendGrid later)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Sign up
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = new User({ email });
    await user.setPassword(password);
    await user.save();

    // generate verification token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    const verifyLink = `${process.env.FRONTEND_URL}/verify/${token}`;

    // send confirmation email
    await transporter.sendMail({
      to: email,
      subject: "Verify your account",
      html: `<p>Click here to verify your email: <a href="${verifyLink}">${verifyLink}</a></p>`,
    });

    res.json({ message: "Signup successful, please check your email to verify." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ✅ Verify Email
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isVerified = true;
    await user.save();
    res.json({ message: "Email verified! You can now log in." });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// ✅ Log in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isValid = await user.validatePassword(password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email first" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ Export as default for ES module import
export default router;
