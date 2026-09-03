const db = require('../config/db');

class UsageController {
  // GET /api/usage
  static async getUsageRecords(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const records = await db.all('SELECT * FROM usage_records WHERE household_id = ? ORDER BY id DESC LIMIT 50', [householdId]);
      return res.json({ success: true, data: records });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch usage records.' });
    }
  }

  // GET /api/usage/:resourceType
  static async getUsageByResourceType(req, res) {
    try {
      const householdId = req.query.householdId || (req.user ? req.user.userId : 'sohil104');
      const { resourceType } = req.params;
      const records = await db.all(
        'SELECT * FROM usage_records WHERE household_id = ? AND LOWER(resource_type) = LOWER(?) ORDER BY id DESC LIMIT 30',
        [householdId, resourceType]
      );
      return res.json({ success: true, resource_type: resourceType, data: records });
    } catch (err) {
      return res.status(500).json({ success: false, error: `Failed to fetch usage for ${req.params.resourceType}.` });
    }
  }

  // POST /api/usage
  static async logUsage(req, res) {
    try {
      const householdId = req.body.householdId || (req.user ? req.user.userId : 'sohil104');
      const { resource_type, resource_name, quantity_used, unit, source } = req.body;

      if (!resource_type || quantity_used === undefined) {
        return res.status(400).json({ success: false, error: 'Resource type and quantity used are required.' });
      }

      const result = await db.run(
        `INSERT INTO usage_records (household_id, resource_type, resource_name, quantity_used, unit, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [householdId, resource_type, resource_name || resource_type, quantity_used, unit || 'units', source || 'Manual']
      );

      return res.json({ success: true, message: 'Usage record logged successfully.', id: result.id });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to log usage record.' });
    }
  }

  // POST /api/iot/usage (IoT Telemetry Ingest)
  static async handleIotReading(req, res) {
    try {
      const { device_id, resource_type, reading, timestamp } = req.body;
      const householdId = req.body.householdId || (req.user ? req.user.userId : 'sohil104');

      if (!device_id || !resource_type || reading === undefined) {
        return res.status(400).json({ success: false, error: 'device_id, resource_type, and reading are required.' });
      }

      // Update current usage in resources table
      await db.run(
        `UPDATE resources SET current_usage = ?, updated_at = CURRENT_TIMESTAMP WHERE household_id = ? AND LOWER(resource_type) = LOWER(?)`,
        [reading, householdId, resource_type]
      );

      // Insert into usage records
      const result = await db.run(
        `INSERT INTO usage_records (household_id, resource_type, resource_name, quantity_used, unit, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [householdId, resource_type, `IoT Device (${device_id})`, reading, resource_type === 'Water' ? 'L' : 'kWh', 'IoT']
      );

      return res.json({
        success: true,
        message: `IoT reading processed for ${device_id}`,
        ingested_data: { device_id, resource_type, reading, timestamp: timestamp || new Date().toISOString() },
        record_id: result.id
      });
    } catch (err) {
      console.error('IoT Ingest Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to process IoT sensor reading.' });
    }
  }
}

module.exports = UsageController;
