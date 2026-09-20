module.exports = function makeUpdateReviewController({ updateReview }) {
  return async function updateReviewController(req, res, next) {
    try {
      const review = await updateReview.execute(req.user, req.params.id, req.body);
      return res.status(200).json(review);
    } catch (err) {
      return next(err);
    }
  };
};
