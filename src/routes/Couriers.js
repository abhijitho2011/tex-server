const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 📦 CREATE COURIER BOOKING (Client)
router.post('/', async (req, res) => {
  const {
    type,
    vehicle,
    weight,
    pickup_address,
    delivery_address
  } = req.body;

  if (!type || !vehicle || !weight || !pickup_address || !delivery_address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const trackingId = uuidv4().slice(0, 8);

    const insertQuery = `
      INSERT INTO couriers (
        user_id, type, vehicle, weight, volume,
        pickup_address, delivery_address,
        pickup_pincode, delivery_pincode,
        current_status, hub_from, hub_to,
        via_airline, assigned_partner_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'000000','000000','pending','','',false,null)
      RETURNING id
    `;

    const result = await db.query(insertQuery, [
      1, // static user_id for now
      type,
      vehicle,
      weight,
      0, // placeholder for volume
      pickup_address,
      delivery_address
    ]);

    const courierId = result.rows[0].id;

    await db.query(
      `INSERT INTO courier_logs (courier_id, location, status) VALUES ($1, $2, $3)`,
      [courierId, 'Booked via client', 'pending']
    );

    res.json({ message: 'Courier booked', tracking_id: trackingId });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Error booking courier' });
  }
});

// 📄 GET ALL COURIERS (Admin panel)
router.get('/all', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM couriers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch couriers error:', err);
    res.status(500).json({ message: 'Failed to fetch couriers' });
  }
});

// 🚚 UPDATE COURIER STATUS (Admin panel)
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, location } = req.body;

  if (!status || !location) {
    return res.status(400).json({ message: 'Status and location are required' });
  }

  try {
    await db.query(
      'UPDATE couriers SET current_status = $1 WHERE id = $2',
      [status, id]
    );

    await db.query(
      'INSERT INTO courier_logs (courier_id, location, status) VALUES ($1, $2, $3)',
      [id, location, status]
    );

    res.json({ message: 'Status updated & logged' });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// ✈️ ASSIGN COURIER TO AIRLINE (Optional)
router.put('/:id/airfreight', async (req, res) => {
  const { id } = req.params;
  const { airway_bill, airline_name } = req.body;

  if (!airway_bill || !airline_name) {
    return res.status(400).json({ message: 'Missing airway bill or airline name' });
  }

  try {
    await db.query(
      `UPDATE couriers SET via_airline = true WHERE id = $1`,
      [id]
    );

    await db.query(
      `INSERT INTO courier_logs (courier_id, location, status) VALUES ($1, $2, $3)`,
      [id, `${airline_name} (AWB: ${airway_bill})`, 'Dispatched via airline']
    );

    res.json({ message: 'Courier assigned to airline successfully' });
  } catch (err) {
    console.error('Airfreight error:', err);
    res.status(500).json({ message: 'Failed to assign airfreight' });
  }
});

module.exports = router;
