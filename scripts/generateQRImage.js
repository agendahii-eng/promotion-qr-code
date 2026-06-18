const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function generateQRCodeImage() {
  try {
    const qrCodeId = uuidv4();
    const baseUrl = 'https://hotel-iasi.com/redeem';
    const qrData = `${baseUrl}?id=${qrCodeId}`;
    
    // Ensure output directory exists
    const outputDir = './qr-codes';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate PNG image
    const pngPath = path.join(outputDir, 'qr-code.png');
    await QRCode.toFile(pngPath, qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log(`✅ QR Code PNG generated: ${pngPath}`);
    
    // Generate SVG image
    const svgPath = path.join(outputDir, 'qr-code.svg');
    await QRCode.toFile(svgPath, qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/svg+xml',
      width: 300,
      margin: 2
    });
    
    console.log(`✅ QR Code SVG generated: ${svgPath}`);
    
    // Generate JSON info file
    const infoPath = path.join(outputDir, 'qr-code-info.json');
    const info = {
      qrCodeId,
      qrUrl: qrData,
      generatedAt: new Date().toISOString(),
      possibleRewards: [\n        { type: '10% Discount', description: '10% off hotel booking', discount: 10 },
        { type: '15% Discount', description: '15% off hotel booking', discount: 15 },
        { type: '20% Discount', description: '20% off hotel booking', discount: 20 },
        { type: 'Free Upgrade', description: 'Complimentary room upgrade', discount: null },
        { type: 'Better Luck Next Time', description: 'No discount this time', discount: null }
      ]
    };
    
    fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
    console.log(`✅ QR Code info saved: ${infoPath}`);
    
    console.log('\n🎯 QR Code Details:');
    console.log(`ID: ${qrCodeId}`);
    console.log(`URL: ${qrData}`);
    console.log('\nFiles created:');
    console.log(`- ${pngPath}`);
    console.log(`- ${svgPath}`);
    console.log(`- ${infoPath}`);
    
    return { qrCodeId, pngPath, svgPath, infoPath };
  } catch (error) {
    console.error('Error generating QR code:', error);
    process.exit(1);
  }
}

generateQRCodeImage();
