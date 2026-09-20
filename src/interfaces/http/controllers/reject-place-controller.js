module.exports = function makeRejectPlaceController({ rejectPlace }) {
  return async function rejectPlaceController(req, res, next) {
    try {
      const place = await rejectPlace.execute(req.user, req.params.id);
      return res.status(200).json(place);
    } catch (err) {
      return next(err);
    }
  };
};
