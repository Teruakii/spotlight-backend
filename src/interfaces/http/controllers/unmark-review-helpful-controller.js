module.exports = function makeUnmarkReviewHelpfulController({ setReviewHelpful }) {
  return async function controller(req, res, next) {
    try {
      await setReviewHelpful.execute(req.user, req.params.id, false);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
