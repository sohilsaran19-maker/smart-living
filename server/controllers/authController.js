const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_usage_alert_secret_key_2026';

class AuthController {
  // Check User ID availability
  static async checkUserIdAvailability(req, res) {
    try {
      const { userId } = req.query;
      if (!userId || userId.trim().length < 3) {
        return res.json({ success: true, available: false, message: 'User ID must be at least 3 characters long.' });
      }

      const existing = await db.get('SELECT id FROM users WHERE user_id = ?', [userId.trim().toLowerCase()]);
      if (existing) {
        return res.json({ success: true, available: false, message: 'This User ID is already taken. Please choose another one.' });
      }

      return res.json({ success: true, available: true, message: 'User ID available ✓' });
    } catch (err) {
      console.error('Check User ID Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to validate User ID.' });
    }
  }

  // Register new user
  static async register(req, res) {
    try {
      const { fullName, userId, email, password, householdSize, location } = req.body;
      if (!fullName || !userId || !email || !password) {
        return res.status(400).json({ success: false, error: 'Full Name, User ID, Email, and Password are required.' });
      }

      const cleanUserId = userId.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      // Check uniqueness
      const existingUser = await db.get('SELECT id FROM users WHERE user_id = ? OR email = ?', [cleanUserId, cleanEmail]);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'User ID or Email is already registered.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await db.run(
        `INSERT INTO users (user_id, name, email, password_hash, household_size, location) VALUES (?, ?, ?, ?, ?, ?)`,
        [cleanUserId, fullName.trim(), cleanEmail, passwordHash, parseInt(householdSize) || 4, location || 'Green Oak Eco-District']
      );

      // Create household record
      await db.run(
        `INSERT INTO households (user_id, members, household_type) VALUES (?, ?, ?)`,
        [cleanUserId, parseInt(householdSize) || 4, 'Apartment']
      );

      const user = {
        id: result.id,
        userId: cleanUserId,
        fullName: fullName.trim(),
        email: cleanEmail,
        householdSize: parseInt(householdSize) || 4,
        location: location || 'Green Oak Eco-District',
        isOnboarded: false
      };

      const token = jwt.sign({ userId: cleanUserId, id: result.id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        message: 'Account created successfully!',
        token,
        user
      });
    } catch (err) {
      console.error('Registration Error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { query, password } = req.body;
      if (!query || !password) {
        return res.status(400).json({ success: false, error: 'User ID/Email and Password are required.' });
      }

      const cleanQuery = query.trim().toLowerCase();
      const userRow = await db.get(
        'SELECT * FROM users WHERE user_id = ? OR email = ?',
        [cleanQuery, cleanQuery]
      );

      if (!userRow) {
        return res.status(401).json({ success: false, error: 'Invalid User ID or password. Please try again.' });
      }

      const isMatch = await bcrypt.compare(password, userRow.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid User ID or password. Please try again.' });
      }

      const token = jwt.sign({ userId: userRow.user_id, id: userRow.id }, JWT_SECRET, { expiresIn: '7d' });

      const user = {
        id: userRow.id,
        userId: userRow.user_id,
        fullName: userRow.name,
        email: userRow.email,
        householdSize: userRow.household_size,
        location: userRow.location,
        isOnboarded: true
      };

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user
      });
    } catch (err) {
      console.error('Login Error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error during login.' });
    }
  }

  // Get current user profile
  static async me(req, res) {
    try {
      const userId = req.user ? req.user.userId : 'sohil104';
      const userRow = await db.get('SELECT * FROM users WHERE user_id = ?', [userId]);

      if (!userRow) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      return res.json({
        success: true,
        user: {
          id: userRow.id,
          userId: userRow.user_id,
          fullName: userRow.name,
          email: userRow.email,
          householdSize: userRow.household_size,
          location: userRow.location,
          isOnboarded: true
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
    }
  }
}

module.exports = AuthController;
