module.exports = function makeDeleteReviewController({ deleteReview }) {
  return async function deleteReviewController(req, res, next) {
    try {
      await deleteReview.execute(req.user, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
