module.exports = function makeRecordPlaceViewController({ recordPlaceView }) {
  return async function recordPlaceViewController(req, res, next) {
    try {
      await recordPlaceView.execute(req.params.id, req.user || null);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
