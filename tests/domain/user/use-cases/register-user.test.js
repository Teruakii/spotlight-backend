const RegisterUser = require("../../../../src/domain/user/use-cases/register-user");
const { EmailAlreadyInUseError, InvalidUserDataError } = require("../../../../src/domain/user/errors/errors");
const FakeUserRepository = require("./__fakes__/fake-user-repository");

const fakeHasher = { hash: async (plain) => `hashed:${plain}` };
const fakeRoleRepository = { findByName: async (name) => ({ id: 2, name }) };

const validInput = {
  firstName: "Camille",
  lastName: "Fontaine",
  email: "Camille@Email.com",
  password: "password123",
};

describe("RegisterUser", () => {
  test("สมัครสำเร็จ เก็บ firstName กับ lastName แยกกัน และ lowercase email", async () => {
    const repo = new FakeUserRepository();
    const useCase = new RegisterUser(repo, fakeHasher, fakeRoleRepository);

    const user = await useCase.execute(validInput);

    expect(user.firstName).toBe("Camille");
    expect(user.lastName).toBe("Fontaine");
    expect(user.email).toBe("camille@email.com");
    expect(repo.rows[0].passwordHash).toBe("hashed:password123");
  });

  test("email ซ้ำ (ต่างแค่ตัวพิมพ์เล็กใหญ่) ต้อง throw EmailAlreadyInUseError", async () => {
    const repo = new FakeUserRepository([{ id: 1, email: "camille@email.com" }]);
    const useCase = new RegisterUser(repo, fakeHasher, fakeRoleRepository);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });

  test("email ซ้ำต้องถูกเช็คก่อน hash password", async () => {
    const repo = new FakeUserRepository([{ id: 1, email: "camille@email.com" }]);
    const hasher = { hash: jest.fn() };
    const useCase = new RegisterUser(repo, hasher, fakeRoleRepository);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(EmailAlreadyInUseError);
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  test("race condition: pre-check ผ่านแต่ DB unique constraint ชน ต้องแปลงเป็น EmailAlreadyInUseError", async () => {
    const repo = new FakeUserRepository([{ id: 1, email: "camille@email.com" }]);
    repo.findByEmail = async () => null;
    const useCase = new RegisterUser(repo, fakeHasher, fakeRoleRepository);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });

  test("ไม่ส่ง lastName ต้อง throw InvalidUserDataError", async () => {
    const repo = new FakeUserRepository();
    const useCase = new RegisterUser(repo, fakeHasher, fakeRoleRepository);

    await expect(
      useCase.execute({ ...validInput, lastName: "  " }),
    ).rejects.toBeInstanceOf(InvalidUserDataError);
  });

  test("ส่ง name แบบเดิมมาอย่างเดียว (ไม่มี firstName/lastName) ต้อง throw InvalidUserDataError", async () => {
    const repo = new FakeUserRepository();
    const useCase = new RegisterUser(repo, fakeHasher, fakeRoleRepository);

    await expect(
      useCase.execute({ name: "Camille Fontaine", email: "a@b.com", password: "password123" }),
    ).rejects.toBeInstanceOf(InvalidUserDataError);
  });
});
