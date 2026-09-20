const express = require('express');
const makeRegisterController = require('../controllers/register-controller');
const makeLoginController = require('../controllers/login-controller');
const makeCheckEmailController = require('../controllers/check-email-controller');

module.exports = function authRoutes({ registerUser, login, checkEmailAvailability }) {
  const router = express.Router();

  router.post('/register', makeRegisterController({ registerUser }));
  router.post('/login', makeLoginController({ login }));
  router.get('/check-email', makeCheckEmailController({ checkEmailAvailability }));

  return router;
};