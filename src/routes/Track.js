const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/track/:id
router.get('/:id', async (req, res) => {
  const trackingId = req.params.id;

  try {
    // Find courier by ID or tracking ID
    const courierResult = await db.query(
      'SELECT id, current_status FROM couriers WHERE id = $1',
      [trackingId]
    );

    if (courierResult.rows.length === 0) {
      return res.status(404).json({ message: 'Courier not found' });
    }

    const courier = courierResult.rows[0];

    // Get tracking logs
    const logsResult = await db.query(
      'SELECT location, status, timestamp FROM courier_logs WHERE courier_id = $1 ORDER BY timestamp ASC',
      [courier.id]
    );

    return res.json({
      status: courier.current_status,
      logs: logsResult.rows,
    });
  } catch (err) {
    console.error('Tracking error:', err);
    return res.status(500).json({ message: 'Server error while tracking' });
  }
});

module.exports = router;
