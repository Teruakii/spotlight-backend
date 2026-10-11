module.exports = function makeListMyReviewsController({ listReviewsByUser }) {
  return async function listMyReviewsController(req, res, next) {
    try {
      const reviews = await listReviewsByUser.execute(req.user);
      return res.status(200).json(reviews);
    } catch (err) {
      return next(err);
    }
  };
};
