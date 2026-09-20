module.exports = function makeCreateReviewController({ createReview }) {
  return async function createReviewController(req, res, next) {
    try {
      const review = await createReview.execute(req.user, req.params.placeId, req.body);
      return res.status(201).json(review);
    } catch (err) {
      return next(err);
    }
  };
};
