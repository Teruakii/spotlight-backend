const CreateCategory = require("../../../../src/domain/place/use-cases/create-category");
const FakeCategoryRepository = require("./__fakes__/fake-category-repository");
const { makeAdmin, makeRegularUser } = require("./__fakes__/fake-users");

describe("CreateCategory", () => {
  test("admin สร้าง category ใหม่ได้", async () => {
    const repo = new FakeCategoryRepository();
    const useCase = new CreateCategory(repo);

    const result = await useCase.execute(makeAdmin(), { name: "Dining" });

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Dining");
  });

  test("user ทั่วไป (ไม่ใช่ admin) ต้อง throw Forbidden", async () => {
    const repo = new FakeCategoryRepository();
    const useCase = new CreateCategory(repo);

    await expect(
      useCase.execute(makeRegularUser(), { name: "Dining" }),
    ).rejects.toThrow(/permission/i);
  });

  test("ชื่อว่างต้อง throw validation error", async () => {
    const repo = new FakeCategoryRepository();
    const useCase = new CreateCategory(repo);

    await expect(
      useCase.execute(makeAdmin(), { name: "  " }),
    ).rejects.toThrow();
  });

  test("ชื่อซ้ำกับ category ที่มีอยู่แล้วต้อง throw 409", async () => {
    const repo = new FakeCategoryRepository([{ id: 1, name: "Dining" }]);
    const useCase = new CreateCategory(repo);

    await expect(
      useCase.execute(makeAdmin(), { name: "Dining" }),
    ).rejects.toThrow(/already exists/i);
  });
});
