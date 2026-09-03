class BenchmarkController {
  // GET /api/benchmark
  static async getBenchmark(req, res) {
    try {
      return res.json({
        success: true,
        benchmark_group: 'Simulated 4-Person Eco-District Households',
        anonymized_privacy_notice: 'Individual household identities are strictly anonymized.',
        metrics: {
          water: {
            your_household: '175 L/day',
            neighborhood_avg: '140 L/day',
            comparison: '+25.0% Higher',
            percentile: '68th Percentile (Efficiency Priority)'
          },
          electricity: {
            your_household: '11.0 kWh/day',
            neighborhood_avg: '8.0 kWh/day',
            comparison: '+37.5% Higher',
            percentile: '74th Percentile'
          },
          food_waste: {
            your_household: '0.4 kg/week',
            neighborhood_avg: '1.2 kg/week',
            comparison: '66.7% Lower (Excellent)',
            percentile: '92nd Percentile (Top Eco Performer)'
          },
          overall_efficiency: {
            sustainability_score: 88,
            district_rank: 'Top 15% in Green Oak Eco-District'
          }
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch benchmark comparison.' });
    }
  }
}

module.exports = BenchmarkController;
