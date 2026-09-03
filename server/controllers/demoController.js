class DemoController {
  // POST /api/demo/run
  static async runDemoScenario(req, res) {
    try {
      const timeline = [
        {
          step: 1,
          title: 'Normal Household Consumption Baseline',
          detail: 'Electricity at 8.0 kWh/day, Water at 140 L/day, LPG at 85%. All parameters normal.',
          metric_updates: { water: 140, elec: 8.0, lpg: 85, score: 92 },
          delay_ms: 1200
        },
        {
          step: 2,
          title: 'Water Usage Anomaly Detected',
          detail: 'Water flow rate increases to 175 L/day (+30.8% surge). Garden Irrigation Sector sensor triggered continuous flow.',
          metric_updates: { water: 175, elec: 8.0, lpg: 85, score: 88 },
          delay_ms: 2200
        },
        {
          step: 3,
          title: 'AI Anomaly Warning & Leak Detection',
          detail: 'Critical Alert Generated: Possible Pipe Leak or Garden Valve Left Open. Recommended: Shut off Valve #2.',
          metric_updates: { water: 175, alert: 'Water Leakage Alert', score: 85 },
          delay_ms: 2500
        },
        {
          step: 4,
          title: 'Electricity Spike Triggered',
          detail: 'Power consumption surges from 8.0 kWh to 11.0 kWh/day (+37.5% increase above baseline).',
          metric_updates: { elec: 11.0, score: 82 },
          delay_ms: 2200
        },
        {
          step: 5,
          title: 'Root-Cause Diagnostic Engine Result',
          detail: 'AI Appliance Analysis: Air Conditioner (1400W) running 7.2 hrs accounts for 58% of daily energy load (72% confidence).',
          metric_updates: { primary_cause: 'AC Overuse (72% confidence)', score: 80 },
          delay_ms: 2500
        },
        {
          step: 6,
          title: 'Food Waste Prediction & AI Recipe Engine',
          detail: 'AI identified 1.8 kg Fresh Produce expiring in 48 hrs. Generated Zero-Waste Recipe: "Smart Veggie Medley Stir-Fry".',
          metric_updates: { food_risk: 'High Waste Risk (1.8 kg)', score: 79 },
          delay_ms: 2500
        },
        {
          step: 7,
          title: 'LPG Depletion Forecast',
          detail: 'LPG reserve drops to 25%. AI predicts gas cylinder depletion in approximately 4 days.',
          metric_updates: { lpg: 25, lpg_days_left: 4, score: 78 },
          delay_ms: 2200
        },
        {
          step: 8,
          title: 'System Personalized Recommendations',
          detail: '1. Set AC to 24°C  2. Close Garden Valve #2  3. Cook Veggie Stir-Fry  4. Book LPG Cylinder Refill.',
          metric_updates: { recommendations_count: 4 },
          delay_ms: 2500
        },
        {
          step: 9,
          title: 'Automated Mitigating Actions Applied',
          detail: 'Smart valves closed, AC thermostat adjusted to 24°C, and recipe saved to household meal plan.',
          metric_updates: { water: 140, elec: 8.5, score: 89 },
          delay_ms: 2200
        },
        {
          step: 10,
          title: 'Quantified Environmental & Financial Impact Calculated',
          detail: 'Water Saved: 450 L/month | Electricity Saved: 38 kWh/month | Money Saved: ₹1,850/month | CO₂ Avoided: 14.5 kg.',
          metric_updates: { money_saved: 1850, water_saved: 450, elec_saved: 38, co2_avoided: 14.5, score: 94 },
          delay_ms: 2800
        },
        {
          step: 11,
          title: 'Sustainability Score Improved',
          detail: 'Household Sustainability Score increased from 78 to 94 (+16 points improvement)!',
          metric_updates: { score: 94, score_rank: 'A+ Eco Master' },
          delay_ms: 2000
        },
        {
          step: 12,
          title: 'Demo Complete',
          detail: 'SMART USAGE ALERT — Detect. Predict. Alert. Save.',
          tagline: 'SMART USAGE ALERT — Detect. Predict. Alert. Save.',
          metric_updates: { status: 'Complete' },
          delay_ms: 1000
        }
      ];

      return res.json({
        success: true,
        scenario_name: 'Hackathon Anomaly Detection & Prevention Demo',
        total_steps: 12,
        estimated_demo_duration_seconds: 26,
        timeline: timeline,
        summary_impact: {
          water_saved: '450 Liters/month',
          electricity_saved: '38 kWh/month',
          money_saved: '₹1,850/month',
          co2_avoided: '14.5 kg',
          sustainability_score_improvement: '+16 Points (78 → 94)'
        }
      });
    } catch (err) {
      console.error('Demo Run Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to run demo simulation.' });
    }
  }
}

module.exports = DemoController;
