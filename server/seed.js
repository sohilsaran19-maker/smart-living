const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedData() {
  console.log('🌱 Checking & seeding initial database metrics...');

  // Check if seed user exists
  const existingUser = await db.get('SELECT id FROM users WHERE user_id = "sohil104"');
  if (existingUser) {
    console.log('✅ Seed user "sohil104" already exists in SQLite database.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Seed User
  await db.run(
    `INSERT INTO users (user_id, name, email, password_hash, household_size, location)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['sohil104', 'Sohil Saran', 'sohil@smartalert.io', passwordHash, 4, 'Green Oak Eco-District']
  );

  // 2. Seed Household
  await db.run(
    `INSERT INTO households (user_id, members, household_type) VALUES (?, ?, ?)`,
    ['sohil104', 4, 'Smart Apartment #104']
  );

  // 3. Seed Resources
  const resourcesData = [
    ['sohil104', 'Electricity', 'Electricity Grid Line', 450, 'kWh', 11.0, 8.0, 10.0],
    ['sohil104', 'Water', 'Main Water Line', 180, 'L', 175.0, 140.0, 160.0],
    ['sohil104', 'LPG', 'Kitchen LPG Cylinder', 100, '%', 25.0, 100.0, 30.0],
    ['sohil104', 'Consumables', 'Monthly Essentials', 25, 'items', 18.0, 20.0, 5.0]
  ];

  for (const r of resourcesData) {
    await db.run(
      `INSERT INTO resources (household_id, resource_type, name, quantity, unit, current_usage, normal_usage, threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      r
    );
  }

  // 4. Seed Appliances
  const appliancesData = [
    ['sohil104', 'Air Conditioner (Living Room)', 1400, 7.2, 10.1, 'Active'],
    ['sohil104', 'Smart Refrigerator', 250, 24.0, 2.4, 'Active'],
    ['sohil104', 'Water Heater / Geyser', 2000, 1.5, 3.0, 'Active'],
    ['sohil104', 'Front Load Washing Machine', 500, 1.2, 0.6, 'Standby'],
    ['sohil104', 'Smart LED TV', 120, 4.0, 0.48, 'Active'],
    ['sohil104', 'BLDC Ceiling Fan', 35, 12.0, 0.42, 'Active']
  ];

  for (const a of appliancesData) {
    await db.run(
      `INSERT INTO appliances (household_id, appliance_name, estimated_power, usage_hours, daily_consumption, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      a
    );
  }

  // 5. Seed Food Inventory
  const foodData = [
    ['sohil104', 'Organic Whole Milk', 2.0, 'Liters', '2026-09-02', '2026-09-05', 0.5, 'Fresh', 'Fresh'],
    ['sohil104', 'Fresh Tomatoes', 1.8, 'kg', '2026-09-01', '2026-09-04', 0.4, 'High', 'Expiring'],
    ['sohil104', 'Whole Grain Bread', 1.0, 'pack', '2026-09-02', '2026-09-06', 0.3, 'Medium', 'Use Soon'],
    ['sohil104', 'Brown Rice', 5.0, 'kg', '2026-08-20', '2026-12-31', 0.2, 'Fresh', 'Fresh'],
    ['sohil104', 'Extra Virgin Olive Oil', 1.0, 'bottle', '2026-08-15', '2027-01-01', 0.05, 'Fresh', 'Fresh']
  ];

  for (const f of foodData) {
    await db.run(
      `INSERT INTO food_inventory (household_id, food_name, quantity, unit, purchase_date, expiry_date, consumption_rate, waste_risk, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      f
    );
  }

  // 6. Seed Savings
  await db.run(
    `INSERT INTO savings (household_id, money_saved, water_saved, electricity_saved, food_saved, LPG_saved, CO2_avoided)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['sohil104', 1850, 450, 38, 2.4, 0.2, 14.5]
  );

  // 7. Seed Sustainability Score
  await db.run(
    `INSERT INTO sustainability_scores (household_id, score, food_score, water_score, energy_score, waste_score)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['sohil104', 88, 92, 85, 84, 90]
  );

  // 8. Seed Community Shares
  await db.run(
    `INSERT INTO community_shares (household_id, food_name, quantity, unit, expiry_date, location, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['sohil104', 'Fresh Surplus Bananas', 2.0, 'kg', '2026-09-06', 'Green Oak Eco-District Sector 4', 'Available']
  );

  console.log('🎉 Seed data successfully populated for demo user "sohil104"!');
}

module.exports = seedData;
