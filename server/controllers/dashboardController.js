const db = require('../config/db');
const SustainabilityEngine = require('../services/sustainabilityEngine');
const AlertEngine = require('../services/alertEngine');

class DashboardController {
  static async getDashboardData(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');

      // Run Engines
      const sustainability = await SustainabilityEngine.calculateScores(householdId);
      const activeAlerts = await AlertEngine.evaluateAlerts(householdId);

      const resources = await db.all('SELECT * FROM resources WHERE household_id = ?', [householdId]);
      const inventory = await db.all('SELECT * FROM food_inventory WHERE household_id = ?', [householdId]);
      const usageHistory = await db.all('SELECT * FROM usage_records WHERE household_id = ? ORDER BY id DESC LIMIT 10', [householdId]);
      const savings = await db.get('SELECT * FROM savings WHERE household_id = ? ORDER BY id DESC LIMIT 1', [householdId]);

      // Resource summaries
      const water = resources.find(r => r.resource_type === 'Water') || { current_usage: 175, normal_usage: 140, unit: 'L' };
      const elec = resources.find(r => r.resource_type === 'Electricity') || { current_usage: 11.0, normal_usage: 8.0, unit: 'kWh' };
      const lpg = resources.find(r => r.resource_type === 'LPG') || { current_usage: 25, normal_usage: 100, unit: '%' };

      // Food waste risk items count
      const wasteRiskItems = inventory.filter(i => i.waste_risk === 'High' || i.status === 'Use Soon' || i.status === 'Expiring');

      return res.json({
        success: true,
        data: {
          sustainability_score: sustainability.score,
          sustainability_breakdown: sustainability,
          food_waste_risk_count: wasteRiskItems.length,
          daily_water_usage: {
            current: water.current_usage,
            normal: water.normal_usage,
            pct_change: '+25.0%',
            unit: 'L/day'
          },
          electricity_usage: {
            current: elec.current_usage,
            normal: elec.normal_usage,
            pct_change: '+37.5%',
            unit: 'kWh/day'
          },
          lpg_level: {
            percentage: lpg.current_usage,
            days_remaining: 4,
            status: lpg.current_usage <= 30 ? 'Low Warning' : 'Optimal'
          },
          inventory_summary: {
            total_items: inventory.length,
            fresh_count: inventory.filter(i => i.status === 'Fresh').length,
            expiring_count: wasteRiskItems.length
          },
          active_alerts: activeAlerts,
          savings: savings || {
            money_saved: 1850,
            water_saved: 450,
            electricity_saved: 38,
            food_saved: 2.4,
            LPG_saved: 0.2,
            CO2_avoided: 14.5
          },
          recent_usage: usageHistory
        }
      });
    } catch (err) {
      console.error('Dashboard Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch dashboard data.' });
    }
  }
}

module.exports = DashboardController;
