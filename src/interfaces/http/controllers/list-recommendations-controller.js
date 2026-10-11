module.exports = function makeListRecommendationsController({ recommendPlaces }) {
  return async function controller(req, res, next) {
    try {
      const result = await recommendPlaces.execute(req.user, req.query.limit);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
};
