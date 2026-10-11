const express = require('express');
const authenticate = require('../middlewares/authenticate');
const makeGetProfileController = require('../controllers/get-profile-controller');
const makeListSavedPlacesController = require('../controllers/list-saved-places-controller');
const makeGetMyProfileController = require('../controllers/get-my-profile-controller');
const makeUpdateMyProfileController = require('../controllers/update-my-profile-controller');
const makeListMyReviewsController = require('../controllers/list-my-reviews-controller');
const makeChangePasswordController = require('../controllers/change-password-controller');
const makeDeleteAccountController = require('../controllers/delete-account-controller');

module.exports = function userRoutes(deps) {
  const router = express.Router();
  const auth = authenticate(deps);

  router.get('/me', auth, makeGetProfileController());
  router.delete('/me', auth, makeDeleteAccountController(deps));
  router.get('/me/saved-places', auth, makeListSavedPlacesController(deps));
  router.get('/me/profile', auth, makeGetMyProfileController(deps));
  router.patch('/me/profile', auth, makeUpdateMyProfileController(deps));
  router.get('/me/reviews', auth, makeListMyReviewsController(deps));
  router.post('/me/password', auth, makeChangePasswordController(deps));

  return router;
};
