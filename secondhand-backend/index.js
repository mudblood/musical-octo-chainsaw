console.log('✅ index.js is running')

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path')
const app = express();

// Increase limits for JSON and form-data
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// CORS (cross-origin resource sharing) settings
// ✅ 1️⃣ List the domains you trust (production + dev)
const allowedOrigins = [
  'http://localhost:5173',   // Vue dev server
  'http://localhost:4174',   // dashbaord dev server
  'http://47.84.42.252',     // Your server by IP
  'http://sstuf.com',        // Your domain (HTTP)
  'https://sstuf.com',       // Your domain (HTTPS, future-proof)
  'http://dash.sstuf.com',   // Admin dashboard
  'https://dash.sstuf.com'   // Admin dashboard
];

// ✅ 2️⃣ Helper to allow devices on your LAN (Wi‑Fi testing)
function isLocalNetwork(origin) {
  return /^http:\/\/(192\.168\.|172\.|10\.)/.test(origin);
}

// ✅ 3️⃣ Build the CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // ✅ (a) Allow tools like curl, Postman, mobile apps (they have no `origin`)
    if (!origin) {
      return callback(null, true);
    }

    // ✅ Allow all localhost ports during dev
    if (origin.startsWith('http://localhost')) {
      return callback(null, true);
    }

    // ✅ (b) Allow domains explicitly listed or LAN devices
    if (allowedOrigins.includes(origin) || isLocalNetwork(origin)) {
      return callback(null, true);
    }

    // ✅ (c) Allow *any* subdomain of sstuf.com (e.g. api.sstuf.com, beta.sstuf.com)
    if (/^https?:\/\/([a-z0-9-]+\.)*sstuf\.com$/.test(origin)) {
      return callback(null, true);
    }

    // 🚫 (d) If none of the above match → reject request
    console.log('❌ Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // ✅ Only allow these HTTP verbs
  credentials: true                           // ✅ Allow cookies/authorization headers
};

// ✅ 4️⃣ Apply to your Express app
app.use(cors(corsOptions));

// Get heartbeat
app.get('/ping', (req, res) => {
  res.json({ status: 'ok' })
})

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/secondhand', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// User schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  stylePreferences: [String], // e.g., ['90s', 'silk', 'corporate']
});

const User = mongoose.model('User', userSchema);

// Serve listing photo
const listingsRoute = require('./routes/listings')
app.use('/listings', listingsRoute)

// ✅ Public static files (image URLs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 🚫 Do NOT expose temp to the web
// app.use('/temp', express.static(path.join(__dirname, 'temp')))

// Check email
app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  res.json({ exists: !!user });
});

// Signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hash });
  await user.save();

  res.status(201).json({ message: 'User created' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Incorrect password' });

  res.json({ message: 'Login successful' });
});

app.listen(3000, () => {
  console.log('API server running on http://localhost:3000');
});

// Personalized feed
const Listing = require('./models/listing') // wherever your model is

app.get('/feed/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const listings = await Listing.find({
      styleTag: { $in: user.stylePreferences },
    })

    res.json(listings)
  } catch (err) {
    console.error('Feed error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /admin/users – Get all users
app.get('/admin/users', async (req, res) => {
console.log('📥 Admin listings endpoint hit')
  try {
    // TODO: Secure this route with a token check
    const users = await User.find({}, { password: 0 }) // exclude passwords
    res.json(users)
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete a user
app.delete('/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: 'Error deleting user' })
  }
})

// Edit a user
app.put('/admin/users/:id', async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email },
      { new: true }
    )
    res.json(user)
  } catch (err) {
    console.error('Update error:', err)
    res.status(500).json({ message: 'Error updating user' })
  }
})
