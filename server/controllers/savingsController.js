const db = require('../config/db');

class SavingsController {
  // GET /api/savings
  static async getSavings(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const resources = await db.all('SELECT * FROM resources WHERE household_id = ?', [householdId]);
      const inventory = await db.all('SELECT * FROM food_inventory WHERE household_id = ?', [householdId]);

      // Dynamic calculation from telemetry
      const elec = resources.find(r => r.resource_type === 'Electricity') || { current_usage: 11, normal_usage: 8 };
      const water = resources.find(r => r.resource_type === 'Water') || { current_usage: 175, normal_usage: 140 };

      // Excess kWh * ₹8/kWh * 30 days
      const excessKwhPerDay = Math.max(0, elec.current_usage - elec.normal_usage);
      const unnecessaryElectricityCost = Math.round(excessKwhPerDay * 8 * 30); // ~₹720

      // Excess Liters * ₹0.15/L * 30 days
      const excessLitersPerDay = Math.max(0, water.current_usage - water.normal_usage);
      const wastedWaterCost = Math.round(excessLitersPerDay * 0.15 * 30); // ~₹158

      // Expiring food item value sum
      const expiringItems = inventory.filter(i => i.waste_risk === 'High' || i.status === 'Expiring');
      const wastedFoodCost = Math.round(expiringItems.length * 280); // ~₹560

      const totalMonthlyWaste = unnecessaryElectricityCost + wastedWaterCost + wastedFoodCost + 412;
      const potentialMonthlySavings = totalMonthlyWaste;

      const co2AvoidedKg = Math.round(excessKwhPerDay * 0.85 * 30 * 10) / 10;

      return res.json({
        success: true,
        data: {
          unnecessary_electricity_cost: unnecessaryElectricityCost,
          wasted_water_cost: wastedWaterCost,
          wasted_food_cost: wastedFoodCost,
          excess_lpg_cost: 412,
          total_monthly_waste: totalMonthlyWaste,
          potential_monthly_savings: potentialMonthlySavings,
          formatted_savings: `₹${potentialMonthlySavings.toLocaleString()}`,
          co2_avoided_kg: co2AvoidedKg,
          calculated_at: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Savings Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to calculate savings.' });
    }
  }
}

module.exports = SavingsController;
