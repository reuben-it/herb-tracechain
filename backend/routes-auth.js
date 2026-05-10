const express = require('express');
const jwt = require('jsonwebtoken');
const users = require('./users');
require('dotenv').config();

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const found = users[email];
  if (!found || found.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id: found.id,
      email: found.email,
      role: found.role,
      name: found.name,
      fabricId: found.fabricId
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: found.id,
      email: found.email,
      role: found.role,
      name: found.name
    }
  });
});

module.exports = router;