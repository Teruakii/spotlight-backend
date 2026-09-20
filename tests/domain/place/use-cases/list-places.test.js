const ListPlaces = require("../../../../src/domain/place/use-cases/list-places");
const FakePlaceRepository = require("./__fakes__/fake-place-repository");
const { makeRegularUser } = require("./__fakes__/fake-users");
const User = require("../../../../src/domain/user/entities/user");

const OWNER = makeRegularUser({ id: 5 });
const PLACES = [
  { id: 1, createdBy: OWNER.id, categoryId: 1, name: "A", status: "approved" },
  { id: 2, createdBy: OWNER.id, categoryId: 1, name: "B", status: "pending" },
  { id: 3, createdBy: 99, categoryId: 1, name: "C", status: "rejected" },
];

function makeModeratorOnly() {
  return new User({ id: 10, role: "moderator", permissions: ["place:moderate"] });
}

describe("ListPlaces", () => {
  test("ไม่ login เห็นแค่ approved เท่านั้น", async () => {
    const repo = new FakePlaceRepository(PLACES);
    const useCase = new ListPlaces(repo);

    const result = await useCase.execute({}, null);

    expect(result.map((p) => p.id)).toEqual([1]);
  });

  test("user ทั่วไป (ไม่มี permission พิเศษ) เห็นแค่ approved แม้ระบุ status filter มา", async () => {
    const repo = new FakePlaceRepository(PLACES);
    const useCase = new ListPlaces(repo);

    const result = await useCase.execute({ status: "pending" }, OWNER);

    expect(result.map((p) => p.id)).toEqual([1]);
  });

  test("SECURITY FIX: role ที่มีแค่ place:moderate (ไม่มี place:manage_any) ต้องยังกรอง status ได้ปกติ", async () => {
    const repo = new FakePlaceRepository(PLACES);
    const useCase = new ListPlaces(repo);

    const result = await useCase.execute({ status: "pending" }, makeModeratorOnly());

    expect(result.map((p) => p.id)).toEqual([2]);
  });

  test("mine=true คืนของตัวเองทุก status โดยไม่ต้องมี permission พิเศษ", async () => {
    const repo = new FakePlaceRepository(PLACES);
    const useCase = new ListPlaces(repo);

    const result = await useCase.execute({ mine: "true" }, OWNER);

    expect(result.map((p) => p.id).sort()).toEqual([1, 2]);
  });
});
