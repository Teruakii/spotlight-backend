const express = require('express');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optional-authenticate');
const requirePermission = require('../middlewares/require-permission');
const reviewRoutes = require('./review-routes');

const makeCreatePlaceController = require('../controllers/create-place-controller');
const makeGetPlaceController = require('../controllers/get-place-controller');
const makeListPlacesController = require('../controllers/list-places-controller');
const makeUpdatePlaceController = require('../controllers/update-place-controller');
const makeDeletePlaceController = require('../controllers/delete-place-controller');
const makeApprovePlaceController = require('../controllers/approve-place-controller');
const makeRejectPlaceController = require('../controllers/reject-place-controller');
const makeListPendingPlacesController = require('../controllers/list-pending-places-controller');
const makeAddPlaceImageController = require('../controllers/add-place-image-controller');
const makeDeletePlaceImageController = require('../controllers/delete-place-image-controller');
const makeAddPlaceTransportController = require('../controllers/add-place-transport-controller');

module.exports = function placeRoutes(deps) {
  const router = express.Router();
  const auth = authenticate(deps);
  const optAuth = optionalAuthenticate(deps);


  router.get('/pending', auth, requirePermission('place:moderate'), makeListPendingPlacesController(deps));
  router.get('/', optAuth, makeListPlacesController(deps));
  router.post('/', auth, makeCreatePlaceController(deps));
  router.get('/:id', optAuth, makeGetPlaceController(deps));
  router.patch('/:id', auth, makeUpdatePlaceController(deps));
  router.delete('/:id', auth, makeDeletePlaceController(deps));
  router.post('/:id/approve', auth, requirePermission('place:moderate'), makeApprovePlaceController(deps));
  router.post('/:id/reject', auth, requirePermission('place:moderate'), makeRejectPlaceController(deps));

  router.post('/:id/images', auth, makeAddPlaceImageController(deps));
  router.delete('/:id/images/:imageId', auth, makeDeletePlaceImageController(deps));
  router.post('/:id/transports', auth, makeAddPlaceTransportController(deps));

  router.use('/:placeId/reviews', reviewRoutes(deps).nested);

  return router;
};
