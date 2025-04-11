const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt = 'tex_' + Date.now() } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay accepts paise
      currency,
      receipt,
    });

    res.json(order);
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

// ✅ Verify Razorpay Payment
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

module.exports = router;
