module.exports = function makeListReviewsController({ listReviewsForPlace }) {
  return async function listReviewsController(req, res, next) {
    try {
      const reviews = await listReviewsForPlace.execute(req.params.placeId);
      return res.status(200).json(reviews);
    } catch (err) {
      return next(err);
    }
  };
};
