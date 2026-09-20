const DeleteCategory = require("../../../../src/domain/place/use-cases/delete-category");
const FakeCategoryRepository = require("./__fakes__/fake-category-repository");
const { makeAdmin, makeRegularUser } = require("./__fakes__/fake-users");

describe("DeleteCategory", () => {
  test("ลบ category ที่ไม่มี place ผูกอยู่ได้สำเร็จ", async () => {
    const repo = new FakeCategoryRepository([{ id: 1, name: "Dining" }]);
    repo.__setPlacesUsingCategory(() => 0);
    const useCase = new DeleteCategory(repo);

    await useCase.execute(makeAdmin(), 1);

    expect(await repo.findById(1)).toBeNull();
  });

  test("ห้ามลบ category ที่ยังมี place ใช้อยู่ — ต้อง throw ก่อนแตะ DB จริง", async () => {
    const repo = new FakeCategoryRepository([{ id: 1, name: "Dining" }]);
    repo.__setPlacesUsingCategory(() => 3); 
    const useCase = new DeleteCategory(repo);

    await expect(useCase.execute(makeAdmin(), 1)).rejects.toThrow(/still use it/i);
    // ต้องยังอยู่ครบ ไม่ได้ถูกลบไปแล้วก่อน throw
    expect(await repo.findById(1)).not.toBeNull();
  });

  test("ลบ category ที่ไม่มีอยู่จริงต้อง throw NotFound", async () => {
    const repo = new FakeCategoryRepository();
    const useCase = new DeleteCategory(repo);

    await expect(useCase.execute(makeAdmin(), 999)).rejects.toThrow(/not found/i);
  });

  test("user ทั่วไปลบ category ไม่ได้", async () => {
    const repo = new FakeCategoryRepository([{ id: 1, name: "Dining" }]);
    const useCase = new DeleteCategory(repo);

    await expect(useCase.execute(makeRegularUser(), 1)).rejects.toThrow(/permission/i);
  });
});
