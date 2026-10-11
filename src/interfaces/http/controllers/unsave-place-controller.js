module.exports = function makeUnsavePlaceController({ unsavePlace }) {
  return async function unsavePlaceController(req, res, next) {
    try {
      await unsavePlace.execute(req.user, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
