// ✅ index.js (pure ES modules version)

import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import parseRoute from "./routes/parse.js";
import listingsRoute from "./routes/listings.js";
import Listing from "./models/listing.js"; // adjust path if needed
import User from "./models/user.js";

dotenv.config();

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("✅ index.js is running");
console.log("Debug key check:", process.env.OPENAI_API_KEY ? "Yes" : "No");

const app = express();

// JSON + form parsing
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ✅ CORS (cross-origin resource sharing)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4174",
  "http://47.84.42.252",
  "http://sstuf.com",
  "https://sstuf.com",
  "http://dash.sstuf.com",
  "https://dash.sstuf.com",
];

function isLocalNetwork(origin) {
  return /^http:\/\/(192\.168\.|172\.|10\.)/.test(origin);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // tools/curl
      if (origin.startsWith("http://localhost")) return callback(null, true);
      if (allowedOrigins.includes(origin) || isLocalNetwork(origin)) return callback(null, true);
      if (/^https?:\/\/([a-z0-9-]+\.)*sstuf\.com$/.test(origin)) return callback(null, true);

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/secondhand");
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));

// ✅ Routes
app.use("/parse-listing", parseRoute);
app.use("/listings", listingsRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve images

// ✅ Heartbeat
app.get("/ping", (req, res) => res.json({ status: "ok" }));

// ✅ Check email
app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  const user = await User.findOne({ email });
  res.json({ exists: !!user });
});

// ✅ Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hash });
  await user.save();

  res.status(201).json({ message: "User created" });
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Incorrect password" });

  res.json({ message: "Login successful" });
});

// ✅ Personalized feed
app.get("/feed/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const listings = await Listing.find({
      styleTag: { $in: user.stylePreferences },
    });

    res.json(listings);
  } catch (err) {
    console.error("Feed error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin users
app.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude passwords
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/admin/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

app.put("/admin/users/:id", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { email }, { new: true });
    res.json(user);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});

// ✅ Start server
app.listen(3000, () => {
  console.log("API server running on http://localhost:3000");
});
