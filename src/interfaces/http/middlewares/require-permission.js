const AppError = require("../../../domain/shared/errors/app-errors");

module.exports = function requirePermission(...requiredPermissions) {
  return function requirePermissionMiddleware(req, res, next) {
    const hasAll =
      req.user &&
      requiredPermissions.every((permission) => req.user.hasPermission(permission));

    if (!hasAll) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    return next();
  };
};
