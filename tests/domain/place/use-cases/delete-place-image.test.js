const DeletePlaceImage = require("../../../../src/domain/place/use-cases/delete-place-image");
const FakePlaceRepository = require("./__fakes__/fake-place-repository");
const FakeImageRepository = require("./__fakes__/fake-image-repository");
const { makeRegularUser } = require("./__fakes__/fake-users");

const OWNER = makeRegularUser({ id: 2 });
const PLACE_A = { id: 10, createdBy: OWNER.id, categoryId: 1, name: "Place A" };
const PLACE_B = { id: 20, createdBy: OWNER.id, categoryId: 1, name: "Place B" };

describe("DeletePlaceImage", () => {
  test("เจ้าของลบรูปของ place ตัวเองได้ปกติ", async () => {
    const placeRepo = new FakePlaceRepository([PLACE_A]);
    const imageRepo = new FakeImageRepository([{ id: 100, placeId: 10, imageUrl: "x" }]);
    const useCase = new DeletePlaceImage(placeRepo, imageRepo);

    await useCase.execute(OWNER, 10, 100);

    expect(await imageRepo.findById(100)).toBeNull();
  });

  test("SECURITY: ห้ามลบรูปของ place อื่นผ่าน URL /places/:id/images/:imageId ที่ id/imageId ไม่ match กัน", async () => {
   
    const placeRepo = new FakePlaceRepository([PLACE_A, PLACE_B]);
    const imageRepo = new FakeImageRepository([{ id: 200, placeId: 20, imageUrl: "y" }]);
    const useCase = new DeletePlaceImage(placeRepo, imageRepo);

    await expect(useCase.execute(OWNER, 10, 200)).rejects.toThrow(/not found/i);

  
    expect(await imageRepo.findById(200)).not.toBeNull();
  });

  test("รูปที่ไม่มีอยู่จริงต้อง throw NotFound", async () => {
    const placeRepo = new FakePlaceRepository([PLACE_A]);
    const imageRepo = new FakeImageRepository([]);
    const useCase = new DeletePlaceImage(placeRepo, imageRepo);

    await expect(useCase.execute(OWNER, 10, 999)).rejects.toThrow(/not found/i);
  });

  test("คนที่ไม่ใช่เจ้าของ place ลบรูปไม่ได้ (เช็คก่อนถึงเรื่อง image ownership ด้วยซ้ำ)", async () => {
    const otherUser = makeRegularUser({ id: 99 });
    const placeRepo = new FakePlaceRepository([PLACE_A]);
    const imageRepo = new FakeImageRepository([{ id: 100, placeId: 10, imageUrl: "x" }]);
    const useCase = new DeletePlaceImage(placeRepo, imageRepo);

    await expect(useCase.execute(otherUser, 10, 100)).rejects.toThrow(/permission/i);
  });
});
