const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Promotion variants
const PROMOTIONS = [
  { type: '10% Discount', description: '10% off', discount: 10 },
  { type: '15% Discount', description: '15% off', discount: 15 },
  { type: '20% Discount', description: '20% off', discount: 20 },
  { type: 'Free Upgrade', description: 'Complimentary room upgrade', discount: null },
  { type: 'Better Luck Next Time', description: 'No discount this time', discount: null }
];

// Generate single QR code with random promotion assignment
const generateSingleQRCode = async (baseUrl = 'https://hotel-iasi.com/redeem') => {
  const qrCodeId = uuidv4();
  const qrData = `${baseUrl}?id=${qrCodeId}`;

  try {
    // Generate QR code as data URL
    const qrImageData = await QRCode.toDataURL(qrData);

    // Save QR code to database (without a specific promotion - it will be random on redemption)
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO qr_codes (id, qr_url, is_active)
         VALUES (?, ?, 1)`,
        [qrCodeId, qrData],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log(`✓ Generated single QR code with ID: ${qrCodeId}`);

    return {
      id: qrCodeId,
      qrImage: qrImageData,
      qrUrl: qrData,
      qrData: qrData
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Get random promotion
const getRandomPromotion = () => {
  return PROMOTIONS[Math.floor(Math.random() * PROMOTIONS.length)];
};

// Verify and redeem QR code with random promotion
const redeemQRCode = async (qrCodeId, guestEmail, ipAddress) => {
  return new Promise((resolve, reject) => {
    // Check if QR code exists
    db.get(
      `SELECT * FROM qr_codes WHERE id = ?`,
      [qrCodeId],
      (err, qrCode) => {
        if (err) return reject(err);
        if (!qrCode) return reject(new Error('Invalid QR code'));
        if (!qrCode.is_active) return reject(new Error('This QR code is no longer active'));

        // Check if this guest has already redeemed
        db.get(
          `SELECT * FROM redemptions WHERE qr_code_id = ? AND guest_email = ?`,
          [qrCode.id, guestEmail],
          (err, redemption) => {
            if (err) return reject(err);
            if (redemption) {
              return reject(new Error('This promotion has already been used by this guest'));
            }

            // Get random promotion
            const randomPromotion = getRandomPromotion();
            const redemptionId = uuidv4();

            // Record redemption with the random promotion
            db.run(
              `INSERT INTO redemptions (id, qr_code_id, guest_email, promotion_type, discount_percentage, ip_address, redeemed_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [redemptionId, qrCode.id, guestEmail, randomPromotion.type, randomPromotion.discount, ipAddress],
              function (err) {
                if (err) return reject(err);

                resolve({
                  success: true,
                  promotion: randomPromotion.type,
                  discount: randomPromotion.discount,
                  description: randomPromotion.description,
                  message: `🎉 Congratulations! You have won: ${randomPromotion.description}`
                });
              }
            );
          }
        );
      }
    );
  });
};

// Get QR code statistics (all redemptions)
const getStatistics = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT promotion_type, COUNT(*) as count
       FROM redemptions
       GROUP BY promotion_type
       ORDER BY count DESC`,
      (err, rows) => {
        if (err) reject(err);
        else {
          const stats = {
            totalRedemptions: 0,
            byPromotion: {}
          };

          rows.forEach(row => {
            stats.byPromotion[row.promotion_type] = row.count;
            stats.totalRedemptions += row.count;
          });

          // Ensure all promotions are in stats (even if 0)
          PROMOTIONS.forEach(promo => {
            if (!stats.byPromotion[promo.type]) {
              stats.byPromotion[promo.type] = 0;
            }
          });

          resolve(stats);
        }
      }
    );
  });
};

// Get QR code details
const getQRCodeDetails = (qrCodeId) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM qr_codes WHERE id = ?`,
      [qrCodeId],
      (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error('QR code not found'));
        else {
          resolve({
            id: row.id,
            qrUrl: row.qr_url,
            isActive: row.is_active === 1,
            createdAt: row.created_at
          });
        }
      }
    );
  });
};

module.exports = {
  generateSingleQRCode,
  getRandomPromotion,
  redeemQRCode,
  getStatistics,
  getQRCodeDetails,
  PROMOTIONS
};