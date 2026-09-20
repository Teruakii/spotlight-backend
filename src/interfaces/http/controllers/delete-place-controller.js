module.exports = function makeDeletePlaceController({ deletePlace }) {
  return async function deletePlaceController(req, res, next) {
    try {
      await deletePlace.execute(req.user, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
