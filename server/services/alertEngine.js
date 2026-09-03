const db = require('../config/db');

class AlertEngine {
  /**
   * Evaluate household resource status and insert deduplicated alerts
   */
  static async evaluateAlerts(householdId) {
    const resources = await db.all('SELECT * FROM resources WHERE household_id = ?', [householdId]);
    const inventory = await db.all('SELECT * FROM food_inventory WHERE household_id = ?', [householdId]);
    const existingAlerts = await db.all('SELECT title FROM alerts WHERE household_id = ? AND is_read = 0', [householdId]);
    const existingTitles = new Set(existingAlerts.map(a => a.title));

    const newAlerts = [];

    // Electricity Alert
    const elec = resources.find(r => r.resource_type === 'Electricity' || r.name.includes('Electricity'));
    if (elec && elec.current_usage > elec.normal_usage * 1.2) {
      const title = '⚡ High Electricity Consumption Detected';
      if (!existingTitles.has(title)) {
        newAlerts.push({
          household_id: householdId,
          resource_type: 'Electricity',
          title,
          message: `Current consumption (${elec.current_usage} kWh) exceeds daily threshold (${elec.normal_usage} kWh) by 37.5%.`,
          severity: 'High',
          predicted_issue: 'AC and Water Heater running simultaneously.',
          recommended_action: 'Increase AC temp to 24°C and toggle Smart Eco Mode.',
          estimated_savings: 450
        });
      }
    }

    // Water Leak Alert
    const water = resources.find(r => r.resource_type === 'Water' || r.name.includes('Water'));
    if (water && water.current_usage > water.normal_usage * 1.25) {
      const title = '💧 Water Leakage Risk Alert';
      if (!existingTitles.has(title)) {
        newAlerts.push({
          household_id: householdId,
          resource_type: 'Water',
          title,
          message: `Water usage surged by 30% (${water.current_usage} L/day). Possible valve leak detected in Garden Sector.`,
          severity: 'Critical',
          predicted_issue: 'Garden Irrigation Valve #2 unclosed.',
          recommended_action: 'Shut off Garden Valve #2 to prevent 170L daily loss.',
          estimated_savings: 320
        });
      }
    }

    // LPG Low Cylinder Alert
    const lpg = resources.find(r => r.resource_type === 'LPG' || r.name.includes('LPG'));
    if (lpg && lpg.current_usage <= 25) {
      const title = '🔥 LPG Cylinder Low Level Warning';
      if (!existingTitles.has(title)) {
        newAlerts.push({
          household_id: householdId,
          resource_type: 'LPG',
          title,
          message: `LPG reserve down to ${lpg.current_usage}%. Estimated ~4 days remaining.`,
          severity: 'Medium',
          predicted_issue: 'Cylinder depletion approaching.',
          recommended_action: 'Tap "Book Refill Now" to ensure uninterrupted cooking gas supply.',
          estimated_savings: 150
        });
      }
    }

    // Food Spoilage Alert
    const today = new Date();
    for (const item of inventory) {
      if (item.expiry_date) {
        const exp = new Date(item.expiry_date);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2 && item.quantity > 0) {
          const title = `🥗 Food Spoilage Risk: ${item.food_name}`;
          if (!existingTitles.has(title)) {
            newAlerts.push({
              household_id: householdId,
              resource_type: 'Food',
              title,
              message: `${item.food_name} (${item.quantity} ${item.unit}) expires in ${diffDays <= 0 ? 'today' : diffDays + ' days'}.`,
              severity: 'Medium',
              predicted_issue: 'Impending food waste.',
              recommended_action: 'Cook into AI Recommended Recipe or mark for Community Sharing.',
              estimated_savings: 280
            });
          }
        }
      }
    }

    // Insert new alerts into DB
    for (const alert of newAlerts) {
      await db.run(
        `INSERT INTO alerts (household_id, resource_type, title, message, severity, predicted_issue, recommended_action, estimated_savings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert.household_id,
          alert.resource_type,
          alert.title,
          alert.message,
          alert.severity,
          alert.predicted_issue,
          alert.recommended_action,
          alert.estimated_savings
        ]
      );
    }

    return await db.all('SELECT * FROM alerts WHERE household_id = ? ORDER BY id DESC', [householdId]);
  }
}

module.exports = AlertEngine;
