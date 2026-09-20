module.exports = function makeGetProfileController() {
  return function getProfileController(req, res) {
    const { user } = req;

    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
  };
};
