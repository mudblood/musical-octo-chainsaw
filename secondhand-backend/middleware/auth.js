const jwt = require('jsonwebtoken');
const User = require('../models/user.js'); // ✅ import your User model

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    // ✅ verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ attach just the user ID (what you already had)
    req.userId = decoded.id;

    // ✅ NEW: fetch the full user object
    const user = await User.findById(decoded.id).select('-password'); 
    // (we exclude password field for security)

    if (!user) return res.status(401).json({ message: 'User not found' });

    // ✅ attach full user object to request
    req.user = user;

    next(); // continue to the route
  } catch (err) {
    console.error('JWT auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};
