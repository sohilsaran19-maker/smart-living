const db = require('../config/db');

class SustainabilityEngine {
  /**
   * Calculate 0-100 Overall & Category Sustainability Scores based on telemetry
   */
  static async calculateScores(householdId) {
    const resources = await db.all('SELECT * FROM resources WHERE household_id = ?', [householdId]);
    const inventory = await db.all('SELECT * FROM food_inventory WHERE household_id = ?', [householdId]);

    let foodScore = 92;
    let waterScore = 85;
    let energyScore = 84;
    let wasteScore = 90;

    // Food Score Penalties for Expired or High Waste Risk Items
    const expiredCount = inventory.filter(i => i.status === 'Expired' || i.waste_risk === 'High').length;
    foodScore = Math.max(50, 95 - (expiredCount * 8));

    // Water Score Calculation
    const water = resources.find(r => r.resource_type === 'Water' || r.name.includes('Water'));
    if (water && water.normal_usage > 0) {
      const pct = (water.current_usage / water.normal_usage) * 100;
      if (pct > 120) waterScore = Math.max(55, 100 - Math.round(pct - 100));
    }

    // Energy Score Calculation
    const elec = resources.find(r => r.resource_type === 'Electricity' || r.name.includes('Electricity'));
    if (elec && elec.normal_usage > 0) {
      const pct = (elec.current_usage / elec.normal_usage) * 100;
      if (pct > 120) energyScore = Math.max(50, 100 - Math.round(pct - 100));
    }

    // Overall Score Weighted Average
    const overallScore = Math.round((foodScore * 0.25) + (waterScore * 0.25) + (energyScore * 0.25) + (wasteScore * 0.25));

    // Update or insert into DB
    const existing = await db.get('SELECT * FROM sustainability_scores WHERE household_id = ?', [householdId]);
    if (existing) {
      await db.run(
        `UPDATE sustainability_scores SET score = ?, food_score = ?, water_score = ?, energy_score = ?, waste_score = ?, updated_at = CURRENT_TIMESTAMP WHERE household_id = ?`,
        [overallScore, foodScore, waterScore, energyScore, wasteScore, householdId]
      );
    } else {
      await db.run(
        `INSERT INTO sustainability_scores (household_id, score, food_score, water_score, energy_score, waste_score) VALUES (?, ?, ?, ?, ?, ?)`,
        [householdId, overallScore, foodScore, waterScore, energyScore, wasteScore]
      );
    }

    return {
      household_id: householdId,
      score: overallScore,
      food_score: foodScore,
      water_score: waterScore,
      energy_score: energyScore,
      waste_score: wasteScore,
      rating: overallScore >= 90 ? 'A+ Eco Master' : overallScore >= 80 ? 'A Eco Efficient' : 'B Sustainable',
      improvements: [
        'Fix Garden Valve #2 to boost Water Efficiency score by +8 pts.',
        'Optimize AC thermostat to boost Energy Efficiency score by +6 pts.',
        'Cook 1.8 kg expiring produce to maximize Food Zero-Waste score.'
      ]
    };
  }
}

module.exports = SustainabilityEngine;
