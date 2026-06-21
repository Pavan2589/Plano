const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

/**
 * Role enforcement middleware factory.
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User session not initialized'));
    }

    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};

module.exports = requireRole;
