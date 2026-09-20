const User = require("../../../../../src/domain/user/entities/user");

const ADMIN_PERMISSIONS = [
  "category:manage",
  "place:manage_any",
  "place:moderate",
  "review:manage_any",
];

function makeAdmin(overrides = {}) {
  return new User({
    id: 1,
    firstName: "Admin",
    lastName: "Tester",
    email: "admin@test.com",
    role: "admin",
    permissions: ADMIN_PERMISSIONS,
    isSuspended: false,
    ...overrides,
  });
}

function makeRegularUser(overrides = {}) {
  return new User({
    id: 2,
    firstName: "Regular",
    lastName: "User",
    email: "user@test.com",
    role: "user",
    permissions: [],
    isSuspended: false,
    ...overrides,
  });
}

module.exports = { makeAdmin, makeRegularUser, ADMIN_PERMISSIONS };
