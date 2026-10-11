module.exports = function makeListNearbyPlacesController({ listNearbyPlaces }) {
  return async function listNearbyPlacesController(req, res, next) {
    try {
      const { lat, lng, ...options } = req.query;
      const places = await listNearbyPlaces.aroundPoint({ lat, lng }, options);
      return res.status(200).json(places);
    } catch (err) {
      return next(err);
    }
  };
};
