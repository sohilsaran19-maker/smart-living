const db = require('../config/db');

class ResourceController {
  // GET /api/resources
  static async getResources(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const resources = await db.all('SELECT * FROM resources WHERE household_id = ?', [householdId]);
      return res.json({ success: true, data: resources });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch resources.' });
    }
  }

  // POST /api/resources
  static async createResource(req, res) {
    try {
      const householdId = req.body.householdId || (req.user ? req.user.userId : 'sohil104');
      const { resource_type, name, quantity, unit, current_usage, normal_usage, threshold } = req.body;

      if (!resource_type || !name) {
        return res.status(400).json({ success: false, error: 'Resource type and name are required.' });
      }

      const result = await db.run(
        `INSERT INTO resources (household_id, resource_type, name, quantity, unit, current_usage, normal_usage, threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [householdId, resource_type, name, quantity || 0, unit || 'units', current_usage || 0, normal_usage || 0, threshold || 0]
      );

      return res.json({ success: true, message: 'Resource created successfully.', id: result.id });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to create resource.' });
    }
  }

  // PUT /api/resources/:id
  static async updateResource(req, res) {
    try {
      const { id } = req.params;
      const { quantity, current_usage, normal_usage, threshold } = req.body;

      await db.run(
        `UPDATE resources SET quantity = COALESCE(?, quantity), current_usage = COALESCE(?, current_usage),
         normal_usage = COALESCE(?, normal_usage), threshold = COALESCE(?, threshold), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [quantity, current_usage, normal_usage, threshold, id]
      );

      return res.json({ success: true, message: 'Resource updated successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to update resource.' });
    }
  }

  // DELETE /api/resources/:id
  static async deleteResource(req, res) {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM resources WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Resource deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete resource.' });
    }
  }
}

module.exports = ResourceController;
