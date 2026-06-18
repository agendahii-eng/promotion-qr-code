const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');
const { redeemQRCode, getStatistics, getQRCodeDetails } = require('./utils/qrCodeGenerator');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes

/**
 * POST /api/redeem
 * Redeem the QR code - returns random promotion
 * Body: { qrCodeId, guestEmail }
 */
app.post('/api/redeem', async (req, res) => {
  try {
    const { qrCodeId, guestEmail } = req.body;

    if (!qrCodeId || !guestEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: qrCodeId, guestEmail'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await redeemQRCode(qrCodeId, guestEmail, ipAddress);

    res.json(result);
  } catch (error) {
    console.error('Redemption error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/statistics
 * Get promotion statistics from all redemptions
 */
app.get('/api/statistics', async (req, res) => {
  try {
    const stats = await getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/qr-code/:qrCodeId
 * Get QR code details
 */
app.get('/api/qr-code/:qrCodeId', async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const qrCode = await getQRCodeDetails(qrCodeId);
    
    res.json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    console.error('QR code details error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'International Iasi Hotel QR Promotion System',
    type: 'Single QR Code with Random Promotions'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Statistics available at http://localhost:${PORT}/api/statistics`);
  console.log(`🏨 International Iasi Hotel QR Promotion System`);
  console.log(`   - Single QR Code with Random Promotions`);
  console.log(`   - Each guest gets one random reward per redemption`);
});

module.exports = app;