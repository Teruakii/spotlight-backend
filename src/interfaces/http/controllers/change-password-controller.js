module.exports = function makeChangePasswordController({ changePassword }) {
  return async function changePasswordController(req, res, next) {
    try {
      await changePassword.execute(req.user, req.body);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
