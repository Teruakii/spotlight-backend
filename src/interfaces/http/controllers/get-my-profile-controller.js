function toProfileJson(user, stats) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    bio: user.bio,
    location: user.location,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    createdAt: user.createdAt,
    stats,
  };
}

function makeGetMyProfileController({ getProfile }) {
  return async function getMyProfileController(req, res, next) {
    try {
      const { user, stats } = await getProfile.execute(req.user);
      return res.status(200).json(toProfileJson(user, stats));
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = makeGetMyProfileController;
module.exports.toProfileJson = toProfileJson;
