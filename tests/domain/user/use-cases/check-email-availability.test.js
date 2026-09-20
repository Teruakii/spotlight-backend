const CheckEmailAvailability = require("../../../../src/domain/user/use-cases/check-email-availability");
const { InvalidUserDataError } = require("../../../../src/domain/user/errors/errors");
const FakeUserRepository = require("./__fakes__/fake-user-repository");

describe("CheckEmailAvailability", () => {
  test("email ที่ยังไม่มีในระบบ available = true", async () => {
    const useCase = new CheckEmailAvailability(new FakeUserRepository());

    const result = await useCase.execute("new@email.com");

    expect(result).toEqual({ email: "new@email.com", available: true });
  });

  test("email ที่มีอยู่แล้ว available = false แม้พิมพ์ตัวใหญ่หรือมีช่องว่าง", async () => {
    const useCase = new CheckEmailAvailability(
      new FakeUserRepository([{ id: 1, email: "taken@email.com" }]),
    );

    const result = await useCase.execute("  Taken@Email.com ");

    expect(result).toEqual({ email: "taken@email.com", available: false });
  });

  test("รูปแบบ email ผิดต้อง throw InvalidUserDataError", async () => {
    const useCase = new CheckEmailAvailability(new FakeUserRepository());

    await expect(useCase.execute("not-an-email")).rejects.toBeInstanceOf(InvalidUserDataError);
  });

  test("ไม่ส่ง email มาเลยต้อง throw InvalidUserDataError", async () => {
    const useCase = new CheckEmailAvailability(new FakeUserRepository());

    await expect(useCase.execute(undefined)).rejects.toBeInstanceOf(InvalidUserDataError);
  });
});
