const express = require('express');
const authenticate = require('../middlewares/authenticate');
const makeGetProfileController = require('../controllers/get-profile-controller');

module.exports = function userRoutes({ tokenService, getUserById }) {
  const router = express.Router();

  router.get('/me', authenticate({ tokenService, getUserById }), makeGetProfileController());

  return router;
};