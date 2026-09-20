module.exports = function makeCreatePlaceController({ createPlace }) {
  return async function createPlaceController(req, res, next) {
    try {
      const place = await createPlace.execute(req.user, req.body);
      return res.status(201).json(place);
    } catch (err) {
      return next(err);
    }
  };
};
