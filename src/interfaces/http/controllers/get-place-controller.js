module.exports = function makeGetPlaceController({ getPlaceById }) {
  return async function getPlaceController(req, res, next) {
    try {
      const place = await getPlaceById.execute(req.params.id, req.user || null);
      return res.status(200).json(place);
    } catch (err) {
      return next(err);
    }
  };
};
