module.exports = function makeListDetailedReviewsController({ listDetailedReviewsForPlace }) {
  return async function controller(req, res, next) {
    try {
      const result = await listDetailedReviewsForPlace.execute(req.params.placeId, req.user || null);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
};
