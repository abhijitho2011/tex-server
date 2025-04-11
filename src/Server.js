const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const courierRoutes = require('./routes/couriers');
const trackingRoutes = require('./routes/track');
const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partners');
const hubRoutes = require('./routes/hubs');
const pricingRoutes = require('./routes/pricing');
const paymentRoutes = require('./routes/payment');

// Mount routes
app.use('/api/couriers', courierRoutes);     // Booking, logs, airline assign
app.use('/api/track', trackingRoutes);       // Client tracking view
app.use('/api/admin', authRoutes);           // Admin login (JWT)
app.use('/api/partners', partnerRoutes);     // KYC submission & review
app.use('/api/hubs', hubRoutes);             // Add/edit/delete hubs
app.use('/api/pricing', pricingRoutes);      // View/update pricing
app.use('/api/payment', paymentRoutes);      // Razorpay order + verify

// Health check
app.get('/', (req, res) => {
  res.send('🚀 Tex Courier backend is up and running!');
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Tex API server running on http://localhost:${PORT}`);
});
