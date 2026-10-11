const UpdateProfile = require("../../../../src/domain/user/use-cases/update-profile");
const ChangePassword = require("../../../../src/domain/user/use-cases/change-password");
const DeleteAccount = require("../../../../src/domain/user/use-cases/delete-account");
const User = require("../../../../src/domain/user/entities/user");
const {
  InvalidUserDataError,
  IncorrectPasswordError,
  AccountHasPlacesError,
} = require("../../../../src/domain/user/errors/errors");
const FakeUserRepository = require("./__fakes__/fake-user-repository");

const fakeHasher = {
  hash: async (plain) => `hashed:${plain}`,
  compare: async (plain, hash) => hash === `hashed:${plain}`,
};

function seedUser(overrides = {}) {
  return {
    id: 2,
    firstName: "Camille",
    lastName: "Fontaine",
    email: "camille@email.com",
    passwordHash: "hashed:old-password",
    role: "user",
    permissions: [],
    ...overrides,
  };
}

function setup(overrides) {
  const repo = new FakeUserRepository([seedUser(overrides)]);
  const user = new User(repo.rows[0]);
  return { repo, user };
}

describe("UpdateProfile", () => {
  test("แก้ bio/location และ string ว่างกลายเป็น null", async () => {
    const { repo, user } = setup({ bio: "old", location: "Paris" });
    const updated = await new UpdateProfile(repo).execute(user, { bio: "  Solo traveler  ", location: "" });

    expect(updated.bio).toBe("Solo traveler");
    expect(updated.location).toBeNull();
    expect(updated.firstName).toBe("Camille");
  });

  test("avatarUrl ที่ไม่ใช่ URL ต้อง throw", async () => {
    const { repo, user } = setup();
    await expect(new UpdateProfile(repo).execute(user, { avatarUrl: "not-a-url" })).rejects.toThrow(
      InvalidUserDataError,
    );
  });

  test("ห้ามแก้ field ที่ไม่อยู่ในรายการ เช่น email หรือ role", async () => {
    const { repo, user } = setup();
    await expect(new UpdateProfile(repo).execute(user, { bio: "hi", role: "admin" })).rejects.toThrow(
      InvalidUserDataError,
    );
    await expect(new UpdateProfile(repo).execute(user, { email: "x@y.com" })).rejects.toThrow(InvalidUserDataError);
    expect(repo.rows[0].role).toBe("user");
  });

  test("ชื่อว่างไม่ได้ และต้องส่งมาอย่างน้อยหนึ่ง field", async () => {
    const { repo, user } = setup();
    await expect(new UpdateProfile(repo).execute(user, { firstName: " " })).rejects.toThrow(InvalidUserDataError);
    await expect(new UpdateProfile(repo).execute(user, {})).rejects.toThrow(InvalidUserDataError);
  });
});

describe("ChangePassword", () => {
  test("รหัสเดิมถูกต้อง เปลี่ยนรหัสและบันทึกเวลาที่เปลี่ยน", async () => {
    const { repo, user } = setup();
    await new ChangePassword(repo, fakeHasher).execute(user, {
      currentPassword: "old-password",
      newPassword: "new-password",
    });

    expect(repo.rows[0].passwordHash).toBe("hashed:new-password");
    expect(repo.rows[0].passwordChangedAt).toBeInstanceOf(Date);
  });

  test("รหัสเดิมผิด ต้อง throw และไม่เปลี่ยนรหัส", async () => {
    const { repo, user } = setup();
    await expect(
      new ChangePassword(repo, fakeHasher).execute(user, { currentPassword: "wrong", newPassword: "new-password" }),
    ).rejects.toThrow(IncorrectPasswordError);
    expect(repo.rows[0].passwordHash).toBe("hashed:old-password");
  });

  test("รหัสใหม่สั้นกว่า 8 ตัวอักษรต้อง throw", async () => {
    const { repo, user } = setup();
    await expect(
      new ChangePassword(repo, fakeHasher).execute(user, { currentPassword: "old-password", newPassword: "short" }),
    ).rejects.toThrow(InvalidUserDataError);
  });
});

describe("DeleteAccount", () => {
  test("รหัสถูกต้องและไม่มี place ลบบัญชีได้", async () => {
    const { repo, user } = setup();
    await new DeleteAccount(repo, fakeHasher).execute(user, { password: "old-password" });
    expect(repo.rows).toHaveLength(0);
  });

  test("ยังมี place ของตัวเองอยู่ ลบไม่ได้", async () => {
    const { repo, user } = setup({ activity: { reviews: 3, savedPlaces: 1, places: 2 } });
    await expect(new DeleteAccount(repo, fakeHasher).execute(user, { password: "old-password" })).rejects.toThrow(
      AccountHasPlacesError,
    );
    expect(repo.rows).toHaveLength(1);
  });

  test("รหัสผิดหรือไม่ส่งรหัส ลบไม่ได้", async () => {
    const { repo, user } = setup();
    await expect(new DeleteAccount(repo, fakeHasher).execute(user, { password: "wrong" })).rejects.toThrow(
      IncorrectPasswordError,
    );
    await expect(new DeleteAccount(repo, fakeHasher).execute(user, {})).rejects.toThrow(InvalidUserDataError);
    expect(repo.rows).toHaveLength(1);
  });
});
