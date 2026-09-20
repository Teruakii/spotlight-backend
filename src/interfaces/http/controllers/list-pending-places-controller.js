module.exports = function makeListPendingPlacesController({ listPlaces }) {
  return async function listPendingPlacesController(req, res, next) {
    try {
      const places = await listPlaces.execute({ status: 'pending' }, req.user);
      return res.status(200).json(places);
    } catch (err) {
      return next(err);
    }
  };
};
