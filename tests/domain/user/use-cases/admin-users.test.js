const { ListUsers, SetUserSuspension, CannotSuspendUserError } = require("../../../../src/domain/user/use-cases/admin-users");
const FakeUserRepository = require("./__fakes__/fake-user-repository");

const ADMIN = { id: 1, firstName: "Ada", lastName: "Admin", email: "ada@x.com", role: "admin", permissions: ["user:manage"], isSuspended: false };
const OTHER_ADMIN = { id: 5, firstName: "Ola", lastName: "Admin", email: "ola@x.com", role: "admin", isSuspended: false };
const CAMILLE = {
  id: 2,
  firstName: "Camille",
  lastName: "Fontaine",
  email: "camille@x.com",
  role: "user",
  isSuspended: false,
  passwordHash: "secret-hash",
  activity: { places: 1, reviews: 3, savedPlaces: 0 },
};
const MARCO = { id: 3, firstName: "Marco", lastName: "D", email: "marco@x.com", role: "user", isSuspended: true };

function setup() {
  const repo = new FakeUserRepository([ADMIN, OTHER_ADMIN, CAMILLE, MARCO].map((u) => ({ ...u })));
  return { repo, list: new ListUsers(repo), suspend: new SetUserSuspension(repo) };
}

describe("Admin users", () => {
  test("ค้นหาด้วยชื่อหรืออีเมล และกรองตามสถานะ", async () => {
    const { list } = setup();
    expect((await list.execute({ search: "fontaine" })).map((u) => u.id)).toEqual([2]);
    expect((await list.execute({ search: "MARCO@" })).map((u) => u.id)).toEqual([3]);
    expect((await list.execute({ status: "suspended" })).map((u) => u.id)).toEqual([3]);
    expect((await list.execute({ status: "active" })).map((u) => u.id)).toEqual([1, 5, 2]);
  });

  test("ผลลัพธ์ไม่มี passwordHash และมีจำนวน places/reviews", async () => {
    const { list } = setup();
    const [camille] = await list.execute({ search: "camille" });
    expect(camille).not.toHaveProperty("passwordHash");
    expect(camille.counts).toEqual({ places: 1, reviews: 3 });
  });

  test("status ที่ไม่รู้จักต้อง throw", async () => {
    const { list } = setup();
    await expect(list.execute({ status: "banned" })).rejects.toThrow();
  });

  test("ระงับและยกเลิกระงับ user ทั่วไปได้", async () => {
    const { suspend, repo } = setup();
    const updated = await suspend.execute(ADMIN, "2", { suspended: true });
    expect(updated.isSuspended).toBe(true);
    expect(repo.rows.find((u) => u.id === 2).isSuspended).toBe(true);

    await suspend.execute(ADMIN, 2, { suspended: false });
    expect(repo.rows.find((u) => u.id === 2).isSuspended).toBe(false);
  });

  test("ระงับบัญชีตัวเองหรือ admin คนอื่นไม่ได้", async () => {
    const { suspend, repo } = setup();
    await expect(suspend.execute(ADMIN, 1, { suspended: true })).rejects.toThrow(CannotSuspendUserError);
    await expect(suspend.execute(ADMIN, 5, { suspended: true })).rejects.toThrow(CannotSuspendUserError);
    expect(repo.rows.filter((u) => u.isSuspended).map((u) => u.id)).toEqual([3]);
  });

  test("user ที่ไม่มีอยู่ได้ not found และ body ผิดรูปแบบต้อง throw", async () => {
    const { suspend } = setup();
    await expect(suspend.execute(ADMIN, 99, { suspended: true })).rejects.toThrow(/not found/i);
    await expect(suspend.execute(ADMIN, 2, { suspended: "yes" })).rejects.toThrow();
  });
});
