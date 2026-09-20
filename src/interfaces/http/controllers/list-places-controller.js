module.exports = function makeListPlacesController({ listPlaces }) {
  return async function listPlacesController(req, res, next) {
    try {
      const { categoryId, status, mine } = req.query;
      const places = await listPlaces.execute({ categoryId, status, mine }, req.user || null);
      return res.status(200).json(places);
    } catch (err) {
      return next(err);
    }
  };
};
