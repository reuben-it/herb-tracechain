const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// =============================================================================
// POST /auth/login
// =============================================================================
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return response matching frontend contract
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (err) {
    next(err);
  }
});

// =============================================================================
// POST /auth/register
// =============================================================================
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        message: 'All fields are required: email, password, name, role'
      });
    }

    // Validate role
    const validRoles = ['collector', 'processor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Role must be one of: collector, processor, admin'
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create user (password is hashed by pre-save hook)
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      role
    });

    // Generate JWT so user is logged in immediately after registration
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (err) {
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err);
  }
});

module.exports = router;
