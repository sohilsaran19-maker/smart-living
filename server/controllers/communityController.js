const db = require('../config/db');

class CommunityController {
  // GET /api/community
  static async getCommunityShares(req, res) {
    try {
      const shares = await db.all('SELECT * FROM community_shares WHERE status = "Available" ORDER BY id DESC');
      return res.json({
        success: true,
        disclaimer: 'Sample/Demo Community Data for Hackathon Prototype',
        count: shares.length,
        data: shares
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch community listings.' });
    }
  }

  // POST /api/community/share
  static async shareSurplusFood(req, res) {
    try {
      const householdId = req.body.householdId || (req.user ? req.user.userId : 'sohil104');
      const { food_name, quantity, unit, expiry_date, location } = req.body;

      if (!food_name) {
        return res.status(400).json({ success: false, error: 'Food name is required.' });
      }

      const result = await db.run(
        `INSERT INTO community_shares (household_id, food_name, quantity, unit, expiry_date, location, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [householdId, food_name, quantity || 1, unit || 'kg', expiry_date || null, location || 'Green Oak Eco-District', 'Available']
      );

      return res.json({
        success: true,
        message: 'Surplus item listed for community sharing!',
        item_id: result.id
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to list surplus food.' });
    }
  }
}

module.exports = CommunityController;
