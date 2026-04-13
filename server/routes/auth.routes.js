import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/Database.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * LOGIN
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM managers WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Optional: validate role
    const allowedRoles = ['admin', 'manager'];
    const userRole = allowedRoles.includes(role) ? role : 'manager';

    // 2. Check if user already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM managers WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 3. Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Insert user
    const [result] = await pool.query(
      'INSERT INTO managers (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, userRole]
    );

    // 5. Generate JWT
    const token = jwt.sign(
      { id: result.insertId, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 6. Response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: userRole
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * PROTECTED ROUTE (any logged-in user)
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * ADMIN ONLY ROUTE
 */
router.get('/admin', authenticate, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin 🚀'
  });
});

export default router;