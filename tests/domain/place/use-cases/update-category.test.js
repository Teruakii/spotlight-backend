const UpdateCategory = require("../../../../src/domain/place/use-cases/update-category");
const FakeCategoryRepository = require("./__fakes__/fake-category-repository");
const { makeAdmin, makeRegularUser } = require("./__fakes__/fake-users");

describe("UpdateCategory", () => {
  test("admin แก้ชื่อ category ที่มีอยู่ได้", async () => {
    const repo = new FakeCategoryRepository([{ id: 1, name: "Dinning" }]); // typo เดิม
    const useCase = new UpdateCategory(repo);

    const result = await useCase.execute(makeAdmin(), 1, { name: "Dining" });

    expect(result.name).toBe("Dining");
  });

  test("แก้ category ที่ไม่มีอยู่จริงต้อง throw NotFound", async () => {
    const repo = new FakeCategoryRepository();
    const useCase = new UpdateCategory(repo);

    await expect(
      useCase.execute(makeAdmin(), 999, { name: "Anything" }),
    ).rejects.toThrow(/not found/i);
  });

  test("เปลี่ยนชื่อเป็นชื่อที่ category อื่นใช้อยู่แล้วต้อง throw 409", async () => {
    const repo = new FakeCategoryRepository([
      { id: 1, name: "Dining" },
      { id: 2, name: "Attraction" },
    ]);
    const useCase = new UpdateCategory(repo);

    await expect(
      useCase.execute(makeAdmin(), 2, { name: "Dining" }),
    ).rejects.toThrow(/already exists/i);
  });

  test("แก้ชื่อเป็นชื่อเดิมของตัวเอง (ไม่เปลี่ยนจริง) ต้องผ่านได้ ไม่ถือว่าซ้ำ", async () => {
    const repo = new FakeCategoryRepository([{ id: 1, name: "Dining" }]);
    const useCase = new UpdateCategory(repo);

    const result = await useCase.execute(makeAdmin(), 1, { name: "Dining" });
    expect(result.name).toBe("Dining");
  });

  test("user ทั่วไปแก้ category ไม่ได้", async () => {
    const repo = new FakeCategoryRepository([{ id: 1, name: "Dining" }]);
    const useCase = new UpdateCategory(repo);

    await expect(
      useCase.execute(makeRegularUser(), 1, { name: "X" }),
    ).rejects.toThrow(/permission/i);
  });
});
