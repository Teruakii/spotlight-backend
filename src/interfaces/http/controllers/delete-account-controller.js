module.exports = function makeDeleteAccountController({ deleteAccount }) {
  return async function deleteAccountController(req, res, next) {
    try {
      await deleteAccount.execute(req.user, req.body);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
