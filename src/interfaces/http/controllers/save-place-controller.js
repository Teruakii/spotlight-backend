module.exports = function makeSavePlaceController({ savePlace }) {
  return async function savePlaceController(req, res, next) {
    try {
      await savePlace.execute(req.user, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
