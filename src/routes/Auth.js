const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// 🔒 Hardcoded admin user (replace with DB in future)
const adminUser = {
  username: 'abhijitho2011',
  password: bcrypt.hashSync('TeX#007744', 10) // hashed for security
};

// ✅ POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username & password required' });
  }

  // Validate admin credentials
  if (
    username !== adminUser.username ||
    !bcrypt.compareSync(password, adminUser.password)
  ) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  res.json({ token });
});

module.exports = router;
