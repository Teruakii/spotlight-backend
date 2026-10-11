module.exports = function makeListSavedPlacesController({ listSavedPlaces }) {
  return async function listSavedPlacesController(req, res, next) {
    try {
      const places = await listSavedPlaces.execute(req.user);
      return res.status(200).json(places);
    } catch (err) {
      return next(err);
    }
  };
};
