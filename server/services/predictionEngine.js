const db = require('../config/db');

class PredictionEngine {
  /**
   * Analyze electricity, water, LPG, and food telemetry for a household
   */
  static async analyzeHousehold(householdId) {
    const resources = await db.all('SELECT * FROM resources WHERE household_id = ?', [householdId]);
    const inventory = await db.all('SELECT * FROM food_inventory WHERE household_id = ?', [householdId]);
    const predictions = [];

    // 1. Electricity Anomaly Analysis
    const elec = resources.find(r => r.resource_type === 'Electricity' || r.name.includes('Electricity'));
    if (elec && elec.normal_usage > 0) {
      const pctIncrease = ((elec.current_usage - elec.normal_usage) / elec.normal_usage) * 100;
      if (pctIncrease > 15) {
        predictions.push({
          household_id: householdId,
          resource_type: 'Electricity',
          prediction_type: 'Excess Usage',
          prediction_message: `Electricity usage is ${pctIncrease.toFixed(1)}% higher than normal daily baseline (${elec.normal_usage} kWh).`,
          confidence: 0.92,
          predicted_date: new Date().toISOString().split('T')[0],
          possible_cause: 'Extended Air Conditioner and Water Heater usage during peak hours.',
          recommended_action: 'Set AC thermostat to 24°C and enable Smart Eco-Power Save mode.'
        });
      }
    }

    // 2. Water Leak / Excess Usage Analysis
    const water = resources.find(r => r.resource_type === 'Water' || r.name.includes('Water'));
    if (water && water.normal_usage > 0) {
      const pctIncrease = ((water.current_usage - water.normal_usage) / water.normal_usage) * 100;
      if (pctIncrease > 20) {
        predictions.push({
          household_id: householdId,
          resource_type: 'Water',
          prediction_type: 'Anomaly',
          prediction_message: `Water consumption spiked by ${pctIncrease.toFixed(1)}% above normal (${water.normal_usage} L/day). Possible pipe leakage or unclosed valve.`,
          confidence: 0.89,
          predicted_date: new Date().toISOString().split('T')[0],
          possible_cause: 'Garden Irrigation Valve left open or main line pressure spike.',
          recommended_action: 'Inspect Main Supply & Garden Irrigation valve. Auto-shutoff recommended.'
        });
      }
    }

    // 3. LPG Depletion Forecast
    const lpg = resources.find(r => r.resource_type === 'LPG' || r.name.includes('LPG'));
    if (lpg) {
      const currentLevelPct = lpg.current_usage; // e.g. 25%
      const avgDailyBurnRate = 2.0; // 2% per day
      const daysRemaining = Math.max(1, Math.round(currentLevelPct / avgDailyBurnRate));
      
      if (currentLevelPct <= 30) {
        predictions.push({
          household_id: householdId,
          resource_type: 'LPG',
          prediction_type: 'Depletion',
          prediction_message: `LPG cylinder is at ${currentLevelPct}%. At current consumption (${avgDailyBurnRate}%/day), it will run out in ~${daysRemaining} days.`,
          confidence: 0.95,
          predicted_date: new Date(Date.now() + daysRemaining * 86400000).toISOString().split('T')[0],
          possible_cause: 'Continuous heavy cooking and low initial gas reserve.',
          recommended_action: 'Book replacement LPG cylinder immediately to prevent cooking outage.'
        });
      }
    }

    // 4. Food Expiry & Waste Risk
    const today = new Date();
    for (const item of inventory) {
      if (item.expiry_date) {
        const expDate = new Date(item.expiry_date);
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && item.quantity > 0) {
          predictions.push({
            household_id: householdId,
            resource_type: 'Food',
            prediction_type: 'Waste',
            prediction_message: `High Waste Risk: ${item.food_name} (${item.quantity} ${item.unit}) expires in ${diffDays <= 0 ? 'TODAY' : diffDays + ' days'}.`,
            confidence: 0.94,
            predicted_date: item.expiry_date,
            possible_cause: 'Low consumption rate vs short shelf life remaining.',
            recommended_action: 'Consume immediately, cook into AI recommended recipe, or share with community.'
          });
        }
      }
    }

    return predictions;
  }
}

module.exports = PredictionEngine;
