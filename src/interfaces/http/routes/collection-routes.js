const express = require('express');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optional-authenticate');

// Each handler maps one HTTP call onto one collection use case.
function handle(run, status = 200) {
  return async function collectionController(req, res, next) {
    try {
      const result = await run(req);
      return status === 204 ? res.status(204).send() : res.status(status).json(result);
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = function collectionRoutes(deps) {
  const router = express.Router();
  const auth = authenticate(deps);
  const optAuth = optionalAuthenticate(deps);
  const {
    listMyCollections,
    createCollection,
    getCollection,
    updateCollection,
    deleteCollection,
    addCollectionItem,
    removeCollectionItem,
    setCollectionLayout,
  } = deps;

  router.get('/', auth, handle((req) => listMyCollections.execute(req.user)));
  router.post('/', auth, handle((req) => createCollection.execute(req.user, req.body), 201));
  router.get('/:id', optAuth, handle((req) => getCollection.execute(req.params.id, req.user || null)));
  router.patch('/:id', auth, handle((req) => updateCollection.execute(req.user, req.params.id, req.body)));
  router.delete('/:id', auth, handle((req) => deleteCollection.execute(req.user, req.params.id), 204));
  router.post('/:id/items', auth, handle((req) => addCollectionItem.execute(req.user, req.params.id, req.body), 201));
  router.delete(
    '/:id/items/:itemId',
    auth,
    handle((req) => removeCollectionItem.execute(req.user, req.params.id, req.params.itemId)),
  );
  router.put('/:id/layout', auth, handle((req) => setCollectionLayout.execute(req.user, req.params.id, req.body)));

  return router;
};
