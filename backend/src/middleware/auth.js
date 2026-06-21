const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Authentication middleware.
 * Verifies the JWT access token in the Authorization header.
 * Attaches the decoded user payload to req.user.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is missing or malformed', 'ACCESS_TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      
      // Attach user payload: { userId, role, clientId, storeIds }
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        clientId: decoded.clientId,
        storeIds: decoded.storeIds || []
      };

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token has expired', 'ACCESS_TOKEN_EXPIRED');
      }
      throw new UnauthorizedError('Access token is invalid', 'ACCESS_TOKEN_INVALID');
    }
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
