const SustainabilityEngine = require('../services/sustainabilityEngine');

class SustainabilityController {
  // GET /api/sustainability
  static async getSustainabilityScore(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const scoreData = await SustainabilityEngine.calculateScores(householdId);
      return res.json({ success: true, data: scoreData });
    } catch (err) {
      console.error('Sustainability Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch sustainability score.' });
    }
  }
}

module.exports = SustainabilityController;
