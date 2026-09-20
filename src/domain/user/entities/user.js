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
    this.role = role; // ชื่อ role แบบ string เช่น "admin" | "user" (repository เป็นคน flatten relation มาให้แล้ว)
    this.permissions = Array.isArray(permissions) ? permissions : [];
    this.isSuspended = isSuspended;
    this.lastLoginAt = lastLoginAt;
    this.passwordChangedAt = passwordChangedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // ตัว authorization จริงตอนนี้คือ permission ไม่ใช่ role อีกต่อไป —
  // use case ทุกตัวควรเรียก hasPermission() แทน isAdmin() ตั้งแต่รอบ RBAC นี้เป็นต้นไป
  hasPermission(permissionName) {
    return this.permissions.includes(permissionName);
  }

  // เก็บไว้เพื่อการแสดงผล/debug เท่านั้น (เช่น badge "Admin" บน UI)
  // ห้ามใช้เช็คสิทธิ์ในการทำงานใดๆ อีก เพราะ role เดียวกันในอนาคตอาจมี permission ต่างกันได้
  // ถ้า admin คนหนึ่งถูกถอด permission บางตัวออกทีหลัง
  isAdmin() {
    return this.role === "admin";
  }

  canLogin() {
    return !this.isSuspended;
  }
}

module.exports = User;
