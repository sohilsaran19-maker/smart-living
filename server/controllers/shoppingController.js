const db = require('../config/db');

class ShoppingController {
  // GET /api/shopping/recommendations
  static async getRecommendations(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const inventory = await db.all('SELECT * FROM food_inventory WHERE household_id = ?', [householdId]);
      const resources = await db.all('SELECT * FROM resources WHERE household_id = ?', [householdId]);

      const needNow = [];
      const needSoon = [];
      const dontBuyYet = [];

      // Categorize inventory items
      for (const item of inventory) {
        if (item.quantity <= 0.5 || item.status === 'Expiring') {
          needNow.push({
            name: item.food_name,
            reason: `Current stock critical (${item.quantity} ${item.unit}). Expiring or depleted.`,
            priority: 'High',
            suggested_quantity: '2.0 ' + item.unit
          });
        } else if (item.quantity <= 1.5 || item.status === 'Use Soon') {
          needSoon.push({
            name: item.food_name,
            reason: `Approaching minimum threshold (${item.quantity} ${item.unit}). Reorder in 3-5 days.`,
            priority: 'Medium',
            suggested_quantity: '1.5 ' + item.unit
          });
        } else {
          dontBuyYet.push({
            name: item.food_name,
            reason: `Sufficient stock on hand (${item.quantity} ${item.unit}). Purchase postponed.`,
            priority: 'Low'
          });
        }
      }

      // Check LPG
      const lpg = resources.find(r => r.resource_type === 'LPG');
      if (lpg && lpg.current_usage <= 30) {
        needNow.push({
          name: 'LPG Gas Cylinder Refill',
          reason: `LPG reserve at ${lpg.current_usage}%. Refill required within 4 days.`,
          priority: 'Critical',
          suggested_quantity: '1 Cylinder'
        });
      }

      return res.json({
        success: true,
        summary: {
          need_now_count: needNow.length,
          need_soon_count: needSoon.length,
          dont_buy_count: dontBuyYet.length
        },
        data: {
          need_now: needNow,
          need_soon: needSoon,
          dont_buy_yet: dontBuyYet
        }
      });
    } catch (err) {
      console.error('Shopping Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to generate shopping recommendations.' });
    }
  }
}

module.exports = ShoppingController;
