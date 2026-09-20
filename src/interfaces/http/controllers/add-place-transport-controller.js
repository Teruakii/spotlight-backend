module.exports = function makeAddPlaceTransportController({ addPlaceTransport }) {
  return async function addPlaceTransportController(req, res, next) {
    try {
      const transport = await addPlaceTransport.execute(req.user, req.params.id, req.body);
      return res.status(201).json(transport);
    } catch (err) {
      return next(err);
    }
  };
};
