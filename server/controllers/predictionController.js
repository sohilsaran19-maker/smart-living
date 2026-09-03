const PredictionEngine = require('../services/predictionEngine');
const RootCauseEngine = require('../services/rootCauseEngine');

class PredictionController {
  // GET /api/predictions
  static async getPredictions(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const predictions = await PredictionEngine.analyzeHousehold(householdId);
      return res.json({ success: true, count: predictions.length, data: predictions });
    } catch (err) {
      console.error('Predictions Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to generate AI predictions.' });
    }
  }

  // GET /api/analysis/root-cause
  static async getRootCauseAnalysis(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const resourceType = req.query.resourceType || 'Electricity';
      const analysis = await RootCauseEngine.analyzeRootCause(householdId, resourceType);
      return res.json({ success: true, data: analysis });
    } catch (err) {
      console.error('Root Cause Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to perform root cause analysis.' });
    }
  }
}

module.exports = PredictionController;
