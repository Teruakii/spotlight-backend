module.exports = function makeRegisterController({ registerUser }) {
  return async function registerController(req, res, next) {
    try {
      const user = await registerUser.execute(req.body);
      return res.status(201).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      return next(err);
    }
  };
};