module.exports = function makeCreateCategoryController({ createCategory }) {
  return async function createCategoryController(req, res, next) {
    try {
      const category = await createCategory.execute(req.user, req.body);
      return res.status(201).json(category);
    } catch (err) {
      return next(err);
    }
  };
};
