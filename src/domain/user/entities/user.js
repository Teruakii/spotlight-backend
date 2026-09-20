class User {
  constructor({
    id,
    firstName,
    lastName,
    email,
    role,
    permissions,
    isSuspended,
    lastLoginAt,
    passwordChangedAt,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.permissions = Array.isArray(permissions) ? permissions : [];
    this.isSuspended = isSuspended;
    this.lastLoginAt = lastLoginAt;
    this.passwordChangedAt = passwordChangedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  hasPermission(permissionName) {
    return this.permissions.includes(permissionName);
  }
  isAdmin() {
    return this.role === "admin";
  }

  canLogin() {
    return !this.isSuspended;
  }
}

module.exports = User;
