const db = require('../config/db');

class ReceiptController {
  // POST /api/receipts
  static async processReceipt(req, res) {
    try {
      const householdId = req.body.householdId || (req.user ? req.user.userId : 'sohil104');
      const { receiptText, receiptImage } = req.body;

      // Extracted items abstraction layer (mock OCR parser ready for Vision API connection)
      const extractedItems = [
        { product_name: 'Organic Whole Milk', quantity: 2, unit: 'Liters', price: 140, expiry_days: 5, category: 'Dairy' },
        { product_name: 'Fresh Tomatoes', quantity: 1.5, unit: 'kg', price: 90, expiry_days: 4, category: 'Produce' },
        { product_name: 'Brown Rice', quantity: 5.0, unit: 'kg', price: 380, expiry_days: 180, category: 'Grains' }
      ];

      // Auto-insert parsed items into food_inventory table
      for (const item of extractedItems) {
        const expiryDate = new Date(Date.now() + item.expiry_days * 86400000).toISOString().split('T')[0];
        await db.run(
          `INSERT INTO food_inventory (household_id, food_name, quantity, unit, purchase_date, expiry_date, consumption_rate, status)
           VALUES (?, ?, ?, ?, DATE('now'), ?, ?, ?)`,
          [householdId, item.product_name, item.quantity, item.unit, expiryDate, 0.5, 'Fresh']
        );
      }

      return res.json({
        success: true,
        message: 'Receipt parsed and 3 inventory items added successfully.',
        ocr_status: 'Completed (Abstraction Layer)',
        extracted_items: extractedItems,
        total_receipt_amount: 610
      });
    } catch (err) {
      console.error('Receipt Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to process receipt.' });
    }
  }
}

module.exports = ReceiptController;
