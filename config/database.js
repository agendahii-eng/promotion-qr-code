const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/promotions.db';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Initialize database schema
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create QR codes table - now only stores the single QR code
      db.run(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id TEXT PRIMARY KEY,
          qr_url TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Create redemptions table to track guest usage with promotion results
      db.run(`
        CREATE TABLE IF NOT EXISTS redemptions (
          id TEXT PRIMARY KEY,
          qr_code_id TEXT NOT NULL,
          guest_email TEXT NOT NULL,
          promotion_type TEXT NOT NULL,
          discount_percentage INTEGER,
          redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip_address TEXT,
          FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id),
          UNIQUE(qr_code_id, guest_email)
        )
      `, (err) => {
        if (err) reject(err);
      });

      resolve();
    });
  });
};

// Run initialization on module load
initializeDatabase().catch(console.error);

module.exports = db;
module.exports.initializeDatabase = initializeDatabase;