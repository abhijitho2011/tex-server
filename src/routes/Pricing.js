// server/src/routes/pricing.js
const express = require('express');
const router = express.Router();

// Dummy data
let pricingTable = [
  { weight: '0-5kg', price: 100 },
  { weight: '5-10kg', price: 150 }
];

// GET pricing
router.get('/', (req, res) => {
  res.json(pricingTable);
});

// POST new pricing
router.post('/', (req, res) => {
  const newEntry = req.body;
  pricingTable.push(newEntry);
  res.status(201).json({ message: 'Pricing added successfully' });
});

module.exports = router;
