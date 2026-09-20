const AddPlaceImage = require("../../../../src/domain/place/use-cases/add-place-image");
const FakePlaceRepository = require("./__fakes__/fake-place-repository");
const FakeImageRepository = require("./__fakes__/fake-image-repository");
const { makeAdmin, makeRegularUser } = require("./__fakes__/fake-users");

const OWNER = makeRegularUser({ id: 2 });
const OTHER_USER = makeRegularUser({ id: 3 });
const PLACE = { id: 10, createdBy: OWNER.id, categoryId: 1, name: "Wat Pho" };

describe("AddPlaceImage", () => {
  test("เจ้าของ place เพิ่มรูปได้", async () => {
    const placeRepo = new FakePlaceRepository([PLACE]);
    const imageRepo = new FakeImageRepository();
    const useCase = new AddPlaceImage(placeRepo, imageRepo);

    const result = await useCase.execute(OWNER, 10, {
      imageUrl: "https://example.com/photo.jpg",
    });

    expect(result.placeId).toBe(10);
    expect(result.imageUrl).toBe("https://example.com/photo.jpg");
  });

  test("admin เพิ่มรูปให้ place ของคนอื่นได้", async () => {
    const placeRepo = new FakePlaceRepository([PLACE]);
    const imageRepo = new FakeImageRepository();
    const useCase = new AddPlaceImage(placeRepo, imageRepo);

    const result = await useCase.execute(makeAdmin(), 10, {
      imageUrl: "https://example.com/photo.jpg",
    });

    expect(result.placeId).toBe(10);
  });

  test("user ที่ไม่ใช่เจ้าของและไม่ใช่ admin เพิ่มรูปไม่ได้", async () => {
    const placeRepo = new FakePlaceRepository([PLACE]);
    const imageRepo = new FakeImageRepository();
    const useCase = new AddPlaceImage(placeRepo, imageRepo);

    await expect(
      useCase.execute(OTHER_USER, 10, { imageUrl: "https://example.com/photo.jpg" }),
    ).rejects.toThrow(/permission/i);
  });

  test("imageUrl ที่ไม่ใช่ URL ที่ถูกต้องต้อง throw", async () => {
    const placeRepo = new FakePlaceRepository([PLACE]);
    const imageRepo = new FakeImageRepository();
    const useCase = new AddPlaceImage(placeRepo, imageRepo);

    await expect(
      useCase.execute(OWNER, 10, { imageUrl: "not-a-url" }),
    ).rejects.toThrow();
  });

  test("place ที่ไม่มีอยู่จริงต้อง throw NotFound", async () => {
    const placeRepo = new FakePlaceRepository([]);
    const imageRepo = new FakeImageRepository();
    const useCase = new AddPlaceImage(placeRepo, imageRepo);

    await expect(
      useCase.execute(OWNER, 999, { imageUrl: "https://example.com/photo.jpg" }),
    ).rejects.toThrow(/not found/i);
  });
});
