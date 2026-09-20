module.exports = function makeLoginController({ login }) {
  return async function loginController(req, res, next) {
    try {
      const { user, token } = await login.execute(req.body);

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      return next(err);
    }
  };
};