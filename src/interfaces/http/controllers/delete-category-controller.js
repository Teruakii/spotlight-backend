module.exports = function makeDeleteCategoryController({ deleteCategory }) {
  return async function deleteCategoryController(req, res, next) {
    try {
      await deleteCategory.execute(req.user, req.params.id);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
};
