module.exports = function makeApprovePlaceController({ approvePlace }) {
  return async function approvePlaceController(req, res, next) {
    try {
      const place = await approvePlace.execute(req.user, req.params.id);
      return res.status(200).json(place);
    } catch (err) {
      return next(err);
    }
  };
};
