// server/src/routes/hubs.js
const express = require('express');
const router = express.Router();

// Dummy route
router.get('/', (req, res) => {
  res.send('Hub routes working!');
});

module.exports = router;
