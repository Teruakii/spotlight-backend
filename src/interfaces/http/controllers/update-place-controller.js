module.exports = function makeUpdatePlaceController({ updatePlace }) {
  return async function updatePlaceController(req, res, next) {
    try {
      const place = await updatePlace.execute(req.user, req.params.id, req.body);
      return res.status(200).json(place);
    } catch (err) {
      return next(err);
    }
  };
};
