const CreatePlace = require("../../../../src/domain/place/use-cases/create-place");
const FakePlaceRepository = require("./__fakes__/fake-place-repository");
const FakeCategoryRepository = require("./__fakes__/fake-category-repository");
const { makeRegularUser } = require("./__fakes__/fake-users");

const DINING_CATEGORY = { id: 1, name: "dining" };

describe("CreatePlace", () => {
  test("สร้าง place พร้อม priceInfo/priceLevel ที่ถูกต้องได้สำเร็จ", async () => {
    const placeRepo = new FakePlaceRepository();
    const categoryRepo = new FakeCategoryRepository([DINING_CATEGORY]);
    const useCase = new CreatePlace(placeRepo, categoryRepo);

    const result = await useCase.execute(makeRegularUser(), {
      categoryId: 1,
      name: "Le Bouchon Bistro",
      priceInfo: "150-400 THB",
      priceLevel: 2,
    });

    expect(result.priceInfo).toBe("150-400 THB");
    expect(result.priceLevel).toBe(2);
    expect(result.status).toBe("pending"); // place ใหม่ต้อง pending เสมอ รอ admin approve
  });

  test("priceLevel เกินช่วง 1-4 ต้อง throw validation error", async () => {
    const placeRepo = new FakePlaceRepository();
    const categoryRepo = new FakeCategoryRepository([DINING_CATEGORY]);
    const useCase = new CreatePlace(placeRepo, categoryRepo);

    await expect(
      useCase.execute(makeRegularUser(), {
        categoryId: 1,
        name: "Test",
        priceLevel: 5,
      }),
    ).rejects.toThrow();
  });

  test("ไม่ใส่ priceInfo/priceLevel มาเลยก็สร้างได้ (เป็น optional)", async () => {
    const placeRepo = new FakePlaceRepository();
    const categoryRepo = new FakeCategoryRepository([DINING_CATEGORY]);
    const useCase = new CreatePlace(placeRepo, categoryRepo);

    const result = await useCase.execute(makeRegularUser(), {
      categoryId: 1,
      name: "Test",
    });

    expect(result.priceInfo).toBeNull();
    expect(result.priceLevel).toBeNull();
  });

  test("categoryId ที่ไม่มีอยู่จริงต้อง throw", async () => {
    const placeRepo = new FakePlaceRepository();
    const categoryRepo = new FakeCategoryRepository([]); // ว่างเปล่า ไม่มี category ไหนเลย
    const useCase = new CreatePlace(placeRepo, categoryRepo);

    await expect(
      useCase.execute(makeRegularUser(), { categoryId: 999, name: "Test" }),
    ).rejects.toThrow(/category/i);
  });

  test("ชื่อว่างต้อง throw", async () => {
    const placeRepo = new FakePlaceRepository();
    const categoryRepo = new FakeCategoryRepository([DINING_CATEGORY]);
    const useCase = new CreatePlace(placeRepo, categoryRepo);

    await expect(
      useCase.execute(makeRegularUser(), { categoryId: 1, name: "  " }),
    ).rejects.toThrow();
  });
});
