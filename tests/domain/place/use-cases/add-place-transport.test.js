const AddPlaceTransport = require("../../../../src/domain/place/use-cases/add-place-transport");
const FakePlaceRepository = require("./__fakes__/fake-place-repository");
const FakeTransportRepository = require("./__fakes__/fake-transport-repository");
const { makeRegularUser } = require("./__fakes__/fake-users");

const OWNER = makeRegularUser({ id: 2 });
const OTHER_USER = makeRegularUser({ id: 3 });
const PLACE = { id: 10, createdBy: OWNER.id, categoryId: 1, name: "Wat Pho" };

describe("AddPlaceTransport", () => {
  test("เจ้าของเพิ่มข้อมูลการเดินทางได้", async () => {
    const placeRepo = new FakePlaceRepository([PLACE]);
    const transportRepo = new FakeTransportRepository();
    const useCase = new AddPlaceTransport(placeRepo, transportRepo);

    const result = await useCase.execute(OWNER, 10, {
      method: "Bus",
      detail: "Lines 1, 3, 6, 9, 12",
    });

    expect(result.method).toBe("Bus");
    expect(result.detail).toBe("Lines 1, 3, 6, 9, 12");
  });

  test("method หรือ detail ว่างต้อง throw", async () => {
    const placeRepo = new FakePlaceRepository([PLACE]);
    const transportRepo = new FakeTransportRepository();
    const useCase = new AddPlaceTransport(placeRepo, transportRepo);

    await expect(
      useCase.execute(OWNER, 10, { method: "", detail: "Lines 1" }),
    ).rejects.toThrow();
  });

  test("คนที่ไม่ใช่เจ้าของเพิ่มข้อมูลการเดินทางไม่ได้", async () => {
    const placeRepo = new FakePlaceRepository([PLACE]);
    const transportRepo = new FakeTransportRepository();
    const useCase = new AddPlaceTransport(placeRepo, transportRepo);

    await expect(
      useCase.execute(OTHER_USER, 10, { method: "Bus", detail: "Lines 1" }),
    ).rejects.toThrow(/permission/i);
  });
});
