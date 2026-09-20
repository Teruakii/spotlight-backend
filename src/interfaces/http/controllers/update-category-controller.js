module.exports = function makeUpdateCategoryController({ updateCategory }) {
  return async function updateCategoryController(req, res, next) {
    try {
      const category = await updateCategory.execute(req.user, req.params.id, req.body);
      return res.status(200).json(category);
    } catch (err) {
      return next(err);
    }
  };
};
