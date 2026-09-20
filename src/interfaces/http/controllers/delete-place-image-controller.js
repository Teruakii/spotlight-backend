module.exports = function makeDeletePlaceImageController({ deletePlaceImage }) {
  return async function deletePlaceImageController(req, res, next) {
    try {
      await deletePlaceImage.execute(req.user, req.params.id, req.params.imageId);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
