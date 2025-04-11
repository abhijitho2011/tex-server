const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🔰 Register new partner (with KYC docs)
router.post('/', async (req, res) => {
  const {
    name,
    phone,
    aadhar,
    driving_license,
    vehicle_rc,
    insurance,
    police_clearance,
    photo
  } = req.body;

  if (!name || !phone || !aadhar || !driving_license || !vehicle_rc || !insurance || !police_clearance || !photo) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const insert = `
      INSERT INTO partners 
      (name, phone, aadhar, driving_license, vehicle_rc, insurance, police_clearance, photo, status, approved_by_admin) 
      VALUES 
      ($1,$2,$3,$4,$5,$6,$7,$8,'pending',false)
    `;

    await db.query(insert, [name, phone, aadhar, driving_license, vehicle_rc, insurance, police_clearance, photo]);

    res.json({ message: 'KYC submitted. Awaiting admin approval.' });
  } catch (err) {
    console.error('Partner register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// 🟡 Get all pending partners
router.get('/pending', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM partners WHERE status = 'pending'`);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch partners failed:', err);
    res.status(500).json({ message: 'Could not load pending partners' });
  }
});

// ✅ Approve / Reject partner
router.put('/:id/decision', async (req, res) => {
  const { id } = req.params;
  const { approve } = req.body;

  const status = approve ? 'approved' : 'rejected';

  try {
    await db.query(
      `UPDATE partners SET status = $1, approved_by_admin = $2 WHERE id = $3`,
      [status, approve, id]
    );

    res.json({ message: `Partner ${status}` });
  } catch (err) {
    console.error('Approve/Reject failed:', err);
    res.status(500).json({ message: 'Could not update partner status' });
  }
});

// 🔎 Optional: Get all partners
router.get('/all', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM partners ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch all partners error:', err);
    res.status(500).json({ message: 'Error loading all partners' });
  }
});

module.exports = router;
