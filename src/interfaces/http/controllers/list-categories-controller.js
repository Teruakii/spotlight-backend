module.exports = function makeListCategoriesController({ listCategories }) {
  return async function listCategoriesController(req, res, next) {
    try {
      const categories = await listCategories.execute();
      return res.status(200).json(categories);
    } catch (err) {
      return next(err);
    }
  };
};
