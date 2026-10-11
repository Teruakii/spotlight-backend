const express = require('express');
const authenticate = require('../middlewares/authenticate');
const makeGetProfileController = require('../controllers/get-profile-controller');
const makeListSavedPlacesController = require('../controllers/list-saved-places-controller');

module.exports = function userRoutes(deps) {
  const router = express.Router();
  const auth = authenticate(deps);

  router.get('/me', auth, makeGetProfileController());
  router.get('/me/saved-places', auth, makeListSavedPlacesController(deps));

  return router;
};
