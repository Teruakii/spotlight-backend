const express = require("express");
const authenticate = require("../middlewares/authenticate");
const makeCreateReviewController = require("../controllers/create-review-controller");
const makeListReviewsController = require("../controllers/list-reviews-controller");
const makeUpdateReviewController = require("../controllers/update-review-controller");
const makeDeleteReviewController = require("../controllers/delete-review-controller");

module.exports = function reviewRoutes(deps) {
  const auth = authenticate(deps);

  const nested = express.Router({ mergeParams: true });
  nested.get("/", makeListReviewsController(deps));
  nested.post("/", auth, makeCreateReviewController(deps));

  const standalone = express.Router();
  standalone.patch("/:id", auth, makeUpdateReviewController(deps));
  standalone.delete("/:id", auth, makeDeleteReviewController(deps));

  return { nested, standalone };
};
