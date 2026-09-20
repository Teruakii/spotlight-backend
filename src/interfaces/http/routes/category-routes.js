const express = require("express");
const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/require-permission");
const makeListCategoriesController = require("../controllers/list-categories-controller");
const makeCreateCategoryController = require("../controllers/create-category-controller");
const makeUpdateCategoryController = require("../controllers/update-category-controller");
const makeDeleteCategoryController = require("../controllers/delete-category-controller");

module.exports = function categoryRoutes(deps) {
  const router = express.Router();
  const auth = authenticate(deps);

  router.get("/", makeListCategoriesController(deps));
  router.post("/", auth, requirePermission("category:manage"), makeCreateCategoryController(deps));
  router.patch("/:id", auth, requirePermission("category:manage"), makeUpdateCategoryController(deps));
  router.delete("/:id", auth, requirePermission("category:manage"), makeDeleteCategoryController(deps));

  return router;
};
