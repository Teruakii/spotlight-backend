module.exports = function makeCreateDetailedReviewController({ createDetailedReview }) {
  return async function controller(req, res, next) {
    try {
      const result = await createDetailedReview.execute(req.user, req.params.placeId, req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  };
};
