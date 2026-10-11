const SavePlace = require("../../../../src/domain/saved-place/use-cases/save-place");
const UnsavePlace = require("../../../../src/domain/saved-place/use-cases/unsave-place");
const ListSavedPlaces = require("../../../../src/domain/saved-place/use-cases/list-saved-places");
const GetPlaceById = require("../../../../src/domain/place/use-cases/get-place-by-id");
const FakePlaceRepository = require("../../place/use-cases/__fakes__/fake-place-repository");
const FakeSavedPlaceRepository = require("./__fakes__/fake-saved-place-repository");
const { makeRegularUser } = require("../../place/use-cases/__fakes__/fake-users");

const USER = makeRegularUser({ id: 2 });
const OTHER = makeRegularUser({ id: 3 });
const APPROVED = { id: 10, createdBy: 9, categoryId: 1, name: "Wat Pho", status: "approved" };
const PENDING = { id: 11, createdBy: 9, categoryId: 1, name: "Hidden", status: "pending" };
const OWN_PENDING = { id: 12, createdBy: USER.id, categoryId: 1, name: "Mine", status: "pending" };

function setup(savedSeed = []) {
  const placeRepo = new FakePlaceRepository([APPROVED, PENDING, OWN_PENDING]);
  const savedRepo = new FakeSavedPlaceRepository(placeRepo, savedSeed);
  return {
    savedRepo,
    save: new SavePlace(savedRepo, new GetPlaceById(placeRepo)),
    unsave: new UnsavePlace(savedRepo),
    list: new ListSavedPlaces(savedRepo),
  };
}

describe("Saved places", () => {
  test("บันทึก place ที่ approved แล้วได้ และเห็นในรายการ", async () => {
    const { save, list } = setup();
    await save.execute(USER, "10");

    const places = await list.execute(USER);
    expect(places.map((p) => p.id)).toEqual([10]);
  });

  test("บันทึกซ้ำไม่สร้างแถวซ้ำ", async () => {
    const { save, savedRepo } = setup();
    await save.execute(USER, 10);
    await save.execute(USER, 10);

    expect(savedRepo.rows).toHaveLength(1);
  });

  test("บันทึก place ที่ยัง pending ของคนอื่นไม่ได้ (not found)", async () => {
    const { save, savedRepo } = setup();
    await expect(save.execute(USER, 11)).rejects.toThrow(/not found/i);
    expect(savedRepo.rows).toHaveLength(0);
  });

  test("บันทึก place ที่ไม่มีอยู่จริงไม่ได้", async () => {
    const { save } = setup();
    await expect(save.execute(USER, 999)).rejects.toThrow(/not found/i);
  });

  test("place ที่บันทึกไว้แล้วถูกเปลี่ยนเป็น pending จะไม่แสดงในรายการ ยกเว้นเป็นของตัวเอง", async () => {
    const { list } = setup([
      { userId: USER.id, placeId: 10 },
      { userId: USER.id, placeId: 11 },
      { userId: USER.id, placeId: 12 },
    ]);

    const places = await list.execute(USER);
    expect(places.map((p) => p.id).sort()).toEqual([10, 12]);
  });

  test("รายการของแต่ละ user แยกกัน", async () => {
    const { list } = setup([{ userId: OTHER.id, placeId: 10 }]);
    expect(await list.execute(USER)).toEqual([]);
  });

  test("ยกเลิกบันทึกแล้วหายจากรายการ และยกเลิกซ้ำไม่ error", async () => {
    const { unsave, list } = setup([{ userId: USER.id, placeId: 10 }]);
    await unsave.execute(USER, "10");
    await unsave.execute(USER, "10");

    expect(await list.execute(USER)).toEqual([]);
  });

  test("place id ที่ไม่ใช่ตัวเลขต้อง throw validation error", async () => {
    const { unsave } = setup();
    await expect(unsave.execute(USER, "abc")).rejects.toThrow(/invalid place id/i);
  });
});
