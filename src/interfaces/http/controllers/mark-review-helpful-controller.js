module.exports = function makeMarkReviewHelpfulController({ setReviewHelpful }) {
  return async function controller(req, res, next) {
    try {
      await setReviewHelpful.execute(req.user, req.params.id, true);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
