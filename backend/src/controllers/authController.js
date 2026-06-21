const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');
const { ValidationError, UnauthorizedError, ForbiddenError } = require('../utils/errors');

const authController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required', 'MISSING_CREDENTIALS');
      }

      // Fetch user from DB using case-insensitive search
      const userQuery = `
        SELECT id, name, email, password_hash, role, client_id, is_active 
        FROM users 
        WHERE LOWER(email) = LOWER($1)
      `;
      const userResult = await db.query(userQuery, [email]);

      if (userResult.rows.length === 0) {
        throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const user = userResult.rows[0];

      if (!user.is_active) {
        throw new ForbiddenError('Account is deactivated', 'ACCOUNT_DEACTIVATED');
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      // Fetch assigned storeIds for agent role
      let storeIds = [];
      if (user.role === 'agent') {
        const storeQuery = `
          SELECT store_id 
          FROM agent_store_assignments 
          WHERE agent_id = $1 AND is_active = true
        `;
        const storeResult = await db.query(storeQuery, [user.id]);
        storeIds = storeResult.rows.map(row => row.store_id);
      }

      // Generate Access Token (15 minutes)
      const accessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          clientId: user.client_id,
          storeIds
        },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      // Generate Refresh Token (7 days)
      const refreshToken = jwt.sign(
        { userId: user.id },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Set Refresh Token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
      });

      res.status(200).json({
        accessToken,
        expiresIn: 900 // 15 minutes in seconds
      });
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token is missing', 'REFRESH_TOKEN_MISSING');
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      } catch (err) {
        throw new UnauthorizedError('Invalid or expired refresh token', 'REFRESH_TOKEN_INVALID');
      }

      // Verify user exists and is active
      const userQuery = 'SELECT id, role, client_id, is_active FROM users WHERE id = $1';
      const userResult = await db.query(userQuery, [decoded.userId]);

      if (userResult.rows.length === 0) {
        throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
      }

      const user = userResult.rows[0];

      if (!user.is_active) {
        throw new ForbiddenError('Account is deactivated', 'ACCOUNT_DEACTIVATED');
      }

      // Fetch assigned storeIds for agent role
      let storeIds = [];
      if (user.role === 'agent') {
        const storeQuery = `
          SELECT store_id 
          FROM agent_store_assignments 
          WHERE agent_id = $1 AND is_active = true
        `;
        const storeResult = await db.query(storeQuery, [user.id]);
        storeIds = storeResult.rows.map(row => row.store_id);
      }

      // Generate a new Access Token (15 minutes)
      const accessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          clientId: user.client_id,
          storeIds
        },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({
        accessToken,
        expiresIn: 900
      });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
