const { toProfileJson } = require('./get-my-profile-controller');

module.exports = function makeUpdateMyProfileController({ updateProfile, getProfile }) {
  return async function updateMyProfileController(req, res, next) {
    try {
      const updated = await updateProfile.execute(req.user, req.body);
      const { stats } = await getProfile.execute(updated);
      return res.status(200).json(toProfileJson(updated, stats));
    } catch (err) {
      return next(err);
    }
  };
};
