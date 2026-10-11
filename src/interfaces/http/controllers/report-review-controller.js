module.exports = function makeReportReviewController({ reportReview }) {
  return async function reportReviewController(req, res, next) {
    try {
      const report = await reportReview.execute(req.user, req.params.id, req.body);
      return res.status(201).json(report);
    } catch (err) {
      return next(err);
    }
  };
};
