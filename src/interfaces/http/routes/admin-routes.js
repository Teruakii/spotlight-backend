const express = require('express');
const authenticate = require('../middlewares/authenticate');
const requirePermission = require('../middlewares/require-permission');

function handle(run, status = 200) {
  return async function adminController(req, res, next) {
    try {
      const result = await run(req);
      return status === 204 ? res.status(204).send() : res.status(status).json(result);
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = function adminRoutes(deps) {
  const router = express.Router();
  const auth = authenticate(deps);
  const { getAdminStats, listReportedReviews, moderateReview } = deps;

  router.get('/stats', auth, requirePermission('place:moderate'), handle((req) => getAdminStats.execute(req.query.period)));
  router.get('/reports', auth, requirePermission('review:manage_any'), handle(() => listReportedReviews.execute()));
  router.post(
    '/reviews/:id/moderation',
    auth,
    requirePermission('review:manage_any'),
    handle((req) => moderateReview.execute(req.user, req.params.id, req.body), 204),
  );

  return router;
};
