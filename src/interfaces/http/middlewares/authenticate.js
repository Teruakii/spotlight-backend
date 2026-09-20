const {
  UnauthorizedError,
  AccountSuspendedError,
} = require("../../../domain/auth/errors/errors");
const { UserNotFoundError } = require("../../../domain/user/errors/errors");

module.exports = function authenticate({ tokenService, getUserById }) {
  return async function authenticateMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization || "";
      const [scheme, token] = authHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new UnauthorizedError(
          "Missing or malformed Authorization header",
        );
      }

      let payload;
      try {
        payload = tokenService.verify(token);
      } catch (err) {
        throw new UnauthorizedError("Invalid or expired token");
      }
      let user;
      try {
        user = await getUserById.execute(payload.sub);
      } catch (err) {
        if (err instanceof UserNotFoundError) {
          throw new UnauthorizedError("Invalid or expired token");
        }
        throw err;
      }

      if (!user.canLogin()) {
        throw new AccountSuspendedError();
      }

      req.user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};
