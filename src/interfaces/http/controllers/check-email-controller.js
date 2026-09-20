module.exports = function makeCheckEmailController({ checkEmailAvailability }) {
  return async function checkEmailController(req, res, next) {
    try {
      const result = await checkEmailAvailability.execute(req.query.email);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
};
