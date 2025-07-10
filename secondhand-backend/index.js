console.log('✅ index.js is running')

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();

// CORS (cross-origin resource sharing) settings

const corsOptions = {
  origin: 'http://localhost:5173', // allow your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));

// Get heartbeat
app.get('/ping', (req, res) => {
  res.json({ status: 'ok' })
})

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/secondhand', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  stylePreferences: [String], // e.g., ['90s', 'silk', 'corporate']
});

const User = mongoose.model('User', userSchema);

// Product schema
const itemSchema = new mongoose.Schema({
  imageUrl: String,
  styleTag: String, // e.g., 'cowboy'
  altText: String,  // for screen readers
})
const Item = mongoose.model('Item', itemSchema)

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

app.listen(3000, '0.0.0.0', () => {
  console.log('API server running on http://0.0.0.0:3000');
});

// Personalized feed
app.get('/feed/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const items = await Item.find({
      styleTag: { $in: user.stylePreferences },
    })

    res.json(items)
  } catch (err) {
    console.error('Feed error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /admin/users – Get all users
app.get('/admin/users', async (req, res) => {
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
