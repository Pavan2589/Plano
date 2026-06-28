const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

/**
 * Role enforcement middleware factory.
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("REQ.USER =", req.user);
    console.log("ALLOWED ROLES =", allowedRoles);

    if (!req.user) {
      return next(new UnauthorizedError('User session not initialized'));
    }

    const { role } = req.user;

    console.log("USER ROLE =", role);

    if (!allowedRoles.includes(role)) {
      console.log("ROLE CHECK FAILED");
      return next(
        new ForbiddenError(
          'You do not have permission to perform this action'
        )
      );
    }

    console.log("ROLE CHECK PASSED");

    next();
  };
};

module.exports = requireRole;