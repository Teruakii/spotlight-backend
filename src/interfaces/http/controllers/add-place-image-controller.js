module.exports = function makeAddPlaceImageController({ addPlaceImage }) {
  return async function addPlaceImageController(req, res, next) {
    try {
      const image = await addPlaceImage.execute(req.user, req.params.id, req.body);
      return res.status(201).json(image);
    } catch (err) {
      return next(err);
    }
  };
};
