const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'smart_usage.db');
const rawDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Promisified Database Helper Methods
const db = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  exec: (sql) => {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize Tables Schema
async function initDbSchema() {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      household_size INTEGER DEFAULT 4,
      location TEXT DEFAULT 'Green Oak Eco-District',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS households (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      members INTEGER DEFAULT 4,
      household_type TEXT DEFAULT 'Apartment',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL DEFAULT 0,
      unit TEXT NOT NULL,
      current_usage REAL DEFAULT 0,
      normal_usage REAL DEFAULT 0,
      threshold REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit TEXT NOT NULL,
      purchase_date DATE,
      expiry_date DATE,
      consumption_rate REAL DEFAULT 0.5,
      waste_risk TEXT DEFAULT 'Fresh',
      status TEXT DEFAULT 'Fresh',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_name TEXT NOT NULL,
      quantity_used REAL NOT NULL,
      unit TEXT NOT NULL,
      usage_date DATE DEFAULT (DATE('now')),
      source TEXT DEFAULT 'Manual',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appliances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      appliance_name TEXT NOT NULL,
      estimated_power REAL DEFAULT 0,
      usage_hours REAL DEFAULT 0,
      daily_consumption REAL DEFAULT 0,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL,
      predicted_issue TEXT,
      recommended_action TEXT,
      estimated_savings REAL DEFAULT 0,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      prediction_type TEXT NOT NULL,
      prediction_message TEXT NOT NULL,
      confidence REAL DEFAULT 0.85,
      predicted_date DATE,
      possible_cause TEXT,
      recommended_action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS savings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      money_saved REAL DEFAULT 0,
      water_saved REAL DEFAULT 0,
      electricity_saved REAL DEFAULT 0,
      food_saved REAL DEFAULT 0,
      LPG_saved REAL DEFAULT 0,
      CO2_avoided REAL DEFAULT 0,
      date DATE DEFAULT (DATE('now')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sustainability_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      score INTEGER DEFAULT 88,
      food_score INTEGER DEFAULT 92,
      water_score INTEGER DEFAULT 85,
      energy_score INTEGER DEFAULT 84,
      waste_score INTEGER DEFAULT 90,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      household_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit TEXT NOT NULL,
      expiry_date DATE,
      location TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.exec(schemaSql);
    console.log('✅ SQLite tables initialized successfully.');
  } catch (err) {
    console.error('❌ Schema initialization error:', err);
  }
}

initDbSchema();

module.exports = db;
