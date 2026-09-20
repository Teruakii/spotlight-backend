module.exports = function optionalAuthenticate({ tokenService, getUserById }) {
  return async function optionalAuthenticateMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      req.user = null;
      return next();
    }

    try {
      const payload = tokenService.verify(token);
      const user = await getUserById.execute(payload.sub);
      req.user = user.canLogin() ? user : null;
    } catch (err) {
      req.user = null;
    }

    return next();
  };
};
