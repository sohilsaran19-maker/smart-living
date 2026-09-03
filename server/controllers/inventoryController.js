const db = require('../config/db');

class InventoryController {
  // GET /api/inventory
  static async getInventory(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const items = await db.all('SELECT * FROM food_inventory WHERE household_id = ? ORDER BY id DESC', [householdId]);
      return res.json({ success: true, data: items });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch food inventory.' });
    }
  }

  // POST /api/inventory
  static async createInventoryItem(req, res) {
    try {
      const householdId = req.body.householdId || (req.user ? req.user.userId : 'sohil104');
      const { food_name, quantity, unit, purchase_date, expiry_date, consumption_rate, status } = req.body;

      if (!food_name) {
        return res.status(400).json({ success: false, error: 'Food name is required.' });
      }

      // Calculate waste risk automatically
      let wasteRisk = 'Fresh';
      if (expiry_date) {
        const diffDays = Math.ceil((new Date(expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) wasteRisk = 'High';
        else if (diffDays <= 5) wasteRisk = 'Medium';
      }

      const result = await db.run(
        `INSERT INTO food_inventory (household_id, food_name, quantity, unit, purchase_date, expiry_date, consumption_rate, waste_risk, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [householdId, food_name, quantity || 1, unit || 'kg', purchase_date || new Date().toISOString().split('T')[0], expiry_date || null, consumption_rate || 0.5, wasteRisk, status || 'Fresh']
      );

      return res.json({ success: true, message: 'Item added to inventory.', id: result.id });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to add inventory item.' });
    }
  }

  // PUT /api/inventory/:id
  static async updateInventoryItem(req, res) {
    try {
      const { id } = req.params;
      const { quantity, status, waste_risk } = req.body;

      await db.run(
        `UPDATE food_inventory SET quantity = COALESCE(?, quantity), status = COALESCE(?, status), waste_risk = COALESCE(?, waste_risk) WHERE id = ?`,
        [quantity, status, waste_risk, id]
      );

      return res.json({ success: true, message: 'Inventory item updated.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to update inventory item.' });
    }
  }

  // DELETE /api/inventory/:id
  static async deleteInventoryItem(req, res) {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM food_inventory WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Inventory item deleted.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete inventory item.' });
    }
  }
}

module.exports = InventoryController;
