require('dotenv').config();
const db = require('../config/database');
const { generateSingleQRCode } = require('../utils/qrCodeGenerator');
const fs = require('fs');
const path = require('path');

const QR_OUTPUT_DIR = './qr-codes';

// Ensure output directory exists
if (!fs.existsSync(QR_OUTPUT_DIR)) {
  fs.mkdirSync(QR_OUTPUT_DIR, { recursive: true });
}

const generateQRCode = async () => {
  console.log('🎫 Generating Single QR Code for International Iasi Hotel...\n');

  try {
    const baseUrl = process.env.REDEEM_URL || 'https://hotel-iasi.com/redeem';
    const qrCode = await generateSingleQRCode(baseUrl);

    // Generate HTML file with single QR code
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>International Iasi Hotel - QR Code Promotion</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    .qr-section {
      background: white;
      border: 2px solid #ddd;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .qr-title {
      font-size: 1.8em;
      color: #333;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .qr-subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 1.1em;
    }
    .qr-code-container {
      display: flex;
      justify-content: center;
      margin: 30px 0;
    }
    .qr-code-container img {
      width: 300px;
      height: 300px;
      border: 3px solid #667eea;
      border-radius: 8px;
      padding: 10px;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      text-align: left;
    }
    .info-box h3 {
      color: #1565c0;
      margin-bottom: 10px;
    }
    .info-box ul {
      list-style: none;
      color: #333;
    }
    .info-box li {
      padding: 8px 0;
      border-bottom: 1px solid #bbdefb;
    }
    .info-box li:last-child {
      border-bottom: none;
    }
    .info-box li strong {
      color: #1565c0;
    }
    .promotions-box {
      background: #f3e5f5;
      border-left: 4px solid #764ba2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      text-align: left;
    }
    .promotions-box h3 {
      color: #512da8;
      margin-bottom: 15px;
    }
    .promotion-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e1bee7;
    }
    .promotion-item:last-child {
      border-bottom: none;
    }
    .promotion-icon {
      font-size: 1.5em;
      margin-right: 15px;
      min-width: 30px;
    }
    .promotion-text {
      flex: 1;
      text-align: left;
    }
    .promotion-text strong {
      display: block;
      color: #512da8;
    }
    .promotion-text span {
      color: #666;
      font-size: 0.9em;
    }
    .qr-id {
      margin-top: 25px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
      font-family: monospace;
      word-break: break-all;
      color: #666;
    }
    .print-button {
      margin-top: 30px;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1em;
      cursor: pointer;
      transition: background 0.3s;
    }
    .print-button:hover {
      background: #764ba2;
    }
    footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .header {
        page-break-after: avoid;
      }
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏨 International Iasi Hotel</h1>
      <p>Exclusive QR Code Promotion</p>
      <p style="margin-top: 10px; font-size: 0.95em;">Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="qr-section">
      <div class="qr-title">Scan to Win!</div>
      <div class="qr-subtitle">Each scan reveals a random promotion</div>
      
      <div class="qr-code-container">
        <img src="${qrCode.qrImage}" alt="QR Code for International Iasi Hotel Promotion">
      </div>

      <div class="info-box">
        <h3>ℹ️ How It Works</h3>
        <ul>
          <li><strong>Scan:</strong> Guest scans this QR code with their phone camera or QR scanner app</li>
          <li><strong>Enter Email:</strong> Guest provides their email address on the redemption page</li>
          <li><strong>Win Instantly:</strong> They receive a random promotion result immediately</li>
          <li><strong>One Time Only:</strong> Same email can only redeem once - prevents duplicates</li>
        </ul>
      </div>

      <div class="promotions-box">
        <h3>🎁 Possible Rewards</h3>
        <div class="promotion-item">
          <div class="promotion-icon">🎟️</div>
          <div class="promotion-text">
            <strong>10% Discount</strong>
            <span>10% off hotel booking</span>
          </div>
        </div>
        <div class="promotion-item">
          <div class="promotion-icon">🎟️</div>
          <div class="promotion-text">
            <strong>15% Discount</strong>
            <span>15% off hotel booking</span>
          </div>
        </div>
        <div class="promotion-item">
          <div class="promotion-icon">🎟️</div>
          <div class="promotion-text">
            <strong>20% Discount</strong>
            <span>20% off hotel booking</span>
          </div>
        </div>
        <div class="promotion-item">
          <div class="promotion-icon">⭐</div>
          <div class="promotion-text">
            <strong>Free Room Upgrade</strong>
            <span>Complimentary room upgrade</span>
          </div>
        </div>
        <div class="promotion-item">
          <div class="promotion-icon">🍀</div>
          <div class="promotion-text">
            <strong>Better Luck Next Time</strong>
            <span>Try again for a different promotion</span>
          </div>
        </div>
      </div>

      <div class="qr-id">
        <strong>QR Code ID:</strong> ${qrCode.id}
      </div>

      <button class="print-button" onclick="window.print()">🖨️ Print This QR Code</button>
    </div>

    <footer>
      <p>Guests must provide their email address to prevent duplicate redemptions</p>
      <p>© 2024 International Iasi Hotel. All rights reserved.</p>
      <p style="margin-top: 15px; font-size: 0.9em;">
        Redeem at: <strong>${baseUrl}</strong>
      </p>
    </footer>
  </div>
</body>
</html>
`;

    // Save HTML file
    const htmlPath = path.join(QR_OUTPUT_DIR, 'qr-code-printable.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Generated printable QR code: ${htmlPath}`);

    // Save JSON summary
    const summary = {
      generatedAt: new Date().toISOString(),
      qrCodeId: qrCode.id,
      qrUrl: qrCode.qrData,
      possiblePromotions: [
        { type: '10% Discount', description: '10% off hotel booking', discount: 10 },
        { type: '15% Discount', description: '15% off hotel booking', discount: 15 },
        { type: '20% Discount', description: '20% off hotel booking', discount: 20 },
        { type: 'Free Upgrade', description: 'Complimentary room upgrade', discount: null },
        { type: 'Better Luck Next Time', description: 'No discount this time', discount: null }
      ]
    };

    const jsonPath = path.join(QR_OUTPUT_DIR, 'qr-code-info.json');
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Generated QR code info: ${jsonPath}`);

    console.log('\n📊 QR Code Details:');
    console.log(`  QR Code ID: ${qrCode.id}`);
    console.log(`  Redeem URL: ${process.env.REDEEM_URL || 'https://hotel-iasi.com/redeem'}`);
    console.log(`  Possible Outcomes: 5 different promotions (randomly assigned)`);

  } catch (error) {
    console.error('Error generating QR code:', error);
  } finally {
    db.close();
  }
};

// Run generation
generateQRCode();