const express = require("express");
const authenticate = require("../middlewares/authenticate");
const optionalAuthenticate = require("../middlewares/optional-authenticate");
const makeCreateReviewController = require("../controllers/create-review-controller");
const makeListReviewsController = require("../controllers/list-reviews-controller");
const makeUpdateReviewController = require("../controllers/update-review-controller");
const makeDeleteReviewController = require("../controllers/delete-review-controller");
const makeCreateDetailedReviewController = require("../controllers/create-detailed-review-controller");
const makeListDetailedReviewsController = require("../controllers/list-detailed-reviews-controller");
const makeMarkReviewHelpfulController = require("../controllers/mark-review-helpful-controller");
const makeUnmarkReviewHelpfulController = require("../controllers/unmark-review-helpful-controller");

module.exports = function reviewRoutes(deps) {
  const auth = authenticate(deps);
  const optAuth = optionalAuthenticate(deps);

  const nested = express.Router({ mergeParams: true });
  nested.get("/", makeListReviewsController(deps));
  nested.post("/", auth, makeCreateReviewController(deps));
  nested.get("/detailed", optAuth, makeListDetailedReviewsController(deps));
  nested.post("/detailed", auth, makeCreateDetailedReviewController(deps));

  const standalone = express.Router();
  standalone.patch("/:id", auth, makeUpdateReviewController(deps));
  standalone.delete("/:id", auth, makeDeleteReviewController(deps));
  standalone.put("/:id/helpful", auth, makeMarkReviewHelpfulController(deps));
  standalone.delete("/:id/helpful", auth, makeUnmarkReviewHelpfulController(deps));

  return { nested, standalone };
};
