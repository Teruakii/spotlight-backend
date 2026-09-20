const User = require("../../../../src/domain/user/entities/user");

describe("User entity", () => {
  test("hasPermission() true เมื่อ permission อยู่ใน list", () => {
    const user = new User({ id: 1, role: "admin", permissions: ["category:manage"] });
    expect(user.hasPermission("category:manage")).toBe(true);
  });

  test("hasPermission() false เมื่อ permission ไม่อยู่ใน list", () => {
    const user = new User({ id: 1, role: "user", permissions: [] });
    expect(user.hasPermission("category:manage")).toBe(false);
  });

  test("ไม่ส่ง permissions มาเลย ต้อง default เป็น array ว่าง ไม่ throw", () => {
    const user = new User({ id: 1, role: "user" });
    expect(user.permissions).toEqual([]);
    expect(user.hasPermission("anything")).toBe(false);
  });

  test("isAdmin() เช็คจากชื่อ role เท่านั้น (ใช้เพื่อ display ไม่ใช่ authorization)", () => {
    const admin = new User({ id: 1, role: "admin", permissions: [] });
    const user = new User({ id: 2, role: "user", permissions: [] });
    expect(admin.isAdmin()).toBe(true);
    expect(user.isAdmin()).toBe(false);
  });

  test("canLogin() false เมื่อ isSuspended true", () => {
    const suspended = new User({ id: 1, role: "user", isSuspended: true });
    expect(suspended.canLogin()).toBe(false);
  });
});
