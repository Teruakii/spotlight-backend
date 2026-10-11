module.exports = function makeListPlacesNearPlaceController({ listNearbyPlaces }) {
  return async function listPlacesNearPlaceController(req, res, next) {
    try {
      const places = await listNearbyPlaces.aroundPlace(req.params.id, req.query, req.user || null);
      return res.status(200).json(places);
    } catch (err) {
      return next(err);
    }
  };
};
