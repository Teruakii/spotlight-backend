const express = require('express');
const authRoutes = require('./auth-routes');
const userRoutes = require('./user-routes');
const placeRoutes = require('./place-routes');
const reviewRoutes = require('./review-routes');
const categoryRoutes = require('./category-routes');
const collectionRoutes = require('./collection-routes');

module.exports = function createRouter(deps) {
  const router = express.Router();

  router.use('/auth', authRoutes(deps));
  router.use('/users', userRoutes(deps));
  router.use('/places', placeRoutes(deps));
  router.use('/reviews', reviewRoutes(deps).standalone);
  router.use('/categories', categoryRoutes(deps));
  router.use('/collections', collectionRoutes(deps));

  return router;
};