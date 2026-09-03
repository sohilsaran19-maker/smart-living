class SimulatorController {
  // POST /api/simulator
  static async runSimulation(req, res) {
    try {
      const { ac_reduction_pct, water_reduction_pct, food_purchase_reduction_pct, appliance_reduction_pct } = req.body;

      const acRed = parseFloat(ac_reduction_pct) || 15;
      const waterRed = parseFloat(water_reduction_pct) || 20;
      const foodRed = parseFloat(food_purchase_reduction_pct) || 10;

      // Estimated Monthly Impact Calculations
      const electricitySavedKwh = Math.round(acRed * 2.8 * 30 / 100 * 10) / 10; // ~12.6 kWh/mo
      const waterSavedLiters = Math.round(waterRed * 35 * 30 / 100); // ~210 L/mo
      const foodSavedKg = Math.round(foodRed * 0.25 * 30 / 100 * 10) / 10; // ~0.75 kg/mo

      const moneySavedRupees = Math.round((electricitySavedKwh * 8) + (waterSavedLiters * 0.15) + (foodSavedKg * 120));
      const co2AvoidedKg = Math.round(electricitySavedKwh * 0.85 * 10) / 10;

      const newSustainabilityScore = Math.min(99, 88 + Math.round((acRed + waterRed + foodRed) / 10));

      return res.json({
        success: true,
        simulation_parameters: {
          ac_reduction_pct: `${acRed}%`,
          water_reduction_pct: `${waterRed}%`,
          food_purchase_reduction_pct: `${foodRed}%`
        },
        estimated_monthly_impact: {
          electricity_saved_kwh: electricitySavedKwh,
          water_saved_liters: waterSavedLiters,
          food_saved_kg: foodSavedKg,
          money_saved_rupees: moneySavedRupees,
          formatted_money_saved: `₹${moneySavedRupees.toLocaleString()}`,
          co2_avoided_kg: co2AvoidedKg,
          new_sustainability_score: newSustainabilityScore,
          score_improvement: `+${newSustainabilityScore - 88} points`
        }
      });
    } catch (err) {
      console.error('Simulation Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to run resource twin simulation.' });
    }
  }
}

module.exports = SimulatorController;
