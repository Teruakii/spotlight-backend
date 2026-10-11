const { haversineKm, boundingBox } = require("../../../../src/domain/place/geo");
const ListNearbyPlaces = require("../../../../src/domain/place/use-cases/list-nearby-places");
const RecommendPlaces = require("../../../../src/domain/place/use-cases/recommend-places");
const GetPlaceById = require("../../../../src/domain/place/use-cases/get-place-by-id");
const FakePlaceRepository = require("./__fakes__/fake-place-repository");
const FakeSavedPlaceRepository = require("../../saved-place/use-cases/__fakes__/fake-saved-place-repository");
const { makeRegularUser } = require("./__fakes__/fake-users");

const WAT_PHO = { lat: 13.7465, lng: 100.493 };
const CHIANG_MAI = { lat: 18.7883, lng: 98.9853 };

const ATTRACTION = 1;
const DINING = 2;
const place = (id, categoryId, coords, extra = {}) => ({
  id,
  createdBy: 9,
  categoryId,
  name: `Place ${id}`,
  status: "approved",
  latitude: coords ? String(coords.lat) : null,
  longitude: coords ? String(coords.lng) : null,
  reviews: [],
  ...extra,
});

const PLACES = [
  place(1, ATTRACTION, WAT_PHO),
  place(2, ATTRACTION, { lat: 13.75, lng: 100.4913 }), // Grand Palace, ~0.4 km
  place(3, DINING, { lat: 13.7437, lng: 100.4889 }), // Wat Arun side, ~0.5 km
  place(4, DINING, { lat: 13.7246, lng: 100.5296 }), // Silom, ~4.6 km
  place(5, DINING, CHIANG_MAI),
  place(6, DINING, { lat: 13.7448, lng: 100.4935 }, { status: "pending" }),
  place(7, DINING, null),
  // Inside the 1 km bounding box's corner but ~1.3 km away: only the exact distance check excludes it.
  place(8, ATTRACTION, { lat: WAT_PHO.lat + 0.0085, lng: WAT_PHO.lng + 0.0088 }),
];

function nearby() {
  const repo = new FakePlaceRepository(PLACES);
  return new ListNearbyPlaces(repo, new GetPlaceById(repo));
}

describe("geo", () => {
  test("ระยะ Bangkok ถึง Chiang Mai ประมาณ 580 กม.", () => {
    const km = haversineKm(WAT_PHO, CHIANG_MAI);
    expect(km).toBeGreaterThan(570);
    expect(km).toBeLessThan(600);
  });

  test("ระยะจากจุดเดิมถึงตัวเองเป็น 0", () => {
    expect(haversineKm(WAT_PHO, WAT_PHO)).toBe(0);
  });

  test("bounding box ครอบจุดที่อยู่ห่างไม่เกินรัศมีทุกทิศ", () => {
    const box = boundingBox(WAT_PHO, 5);
    const points = [
      { lat: WAT_PHO.lat + 0.044, lng: WAT_PHO.lng },
      { lat: WAT_PHO.lat, lng: WAT_PHO.lng - 0.045 },
    ];
    for (const p of points) {
      expect(haversineKm(WAT_PHO, p)).toBeLessThan(5);
      expect(p.lat).toBeGreaterThanOrEqual(box.minLat);
      expect(p.lat).toBeLessThanOrEqual(box.maxLat);
      expect(p.lng).toBeGreaterThanOrEqual(box.minLng);
      expect(p.lng).toBeLessThanOrEqual(box.maxLng);
    }
  });
});

describe("ListNearbyPlaces", () => {
  test("รอบ ๆ place: เรียงจากใกล้ไปไกล ไม่รวมตัวเอง ไม่รวม pending หรือไม่มีพิกัด และอยู่ในรัศมี", async () => {
    const result = await nearby().aroundPlace(1, {});
    expect(result.map((p) => p.id)).toEqual([2, 3, 8, 4]);
    expect(result[0].distanceKm).toBeGreaterThan(0.3);
    expect(result[0].distanceKm).toBeLessThan(0.6);
  });

  test("กรองหมวดหมู่ได้ (Nearby Eats)", async () => {
    const result = await nearby().aroundPlace(1, { categoryId: String(DINING) });
    expect(result.map((p) => p.id)).toEqual([3, 4]);
  });

  test("รัศมีเล็กลงตัดที่ไกลออก", async () => {
    const result = await nearby().aroundPlace(1, { radiusKm: "1" });
    expect(result.map((p) => p.id)).toEqual([2, 3]);
  });

  test("place ที่ไม่มีพิกัดได้ผลลัพธ์ว่าง", async () => {
    expect(await nearby().aroundPlace(7, {})).toEqual([]);
  });

  test("รอบ ๆ ตำแหน่ง lat/lng ของผู้ใช้", async () => {
    const result = await nearby().aroundPoint({ lat: "18.79", lng: "98.98" }, {});
    expect(result.map((p) => p.id)).toEqual([5]);
  });

  test("lat/lng ไม่ถูกต้องหรือรัศมีเกิน 100 กม. ต้อง throw", async () => {
    await expect(nearby().aroundPoint({ lat: "abc", lng: "100" }, {})).rejects.toThrow();
    await expect(nearby().aroundPoint({ lat: "13", lng: "100" }, { radiusKm: "500" })).rejects.toThrow();
  });
});

describe("RecommendPlaces", () => {
  const USER = makeRegularUser({ id: 2 });
  const rated = (id, categoryId, ratings, extra = {}) =>
    place(id, categoryId, null, { reviews: ratings.map((rating) => ({ rating })), ...extra });

  function recommend(savedIds, places) {
    const placeRepo = new FakePlaceRepository(places);
    const savedRepo = new FakeSavedPlaceRepository(
      placeRepo,
      savedIds.map((placeId) => ({ userId: USER.id, placeId })),
    );
    return new RecommendPlaces(placeRepo, savedRepo);
  }

  test("แนะนำหมวดเดียวกับที่ save ไว้ก่อน แล้วค่อยเติมด้วย top rated โดยไม่ซ้ำกับที่ save", async () => {
    const places = [
      rated(1, DINING, [5]),
      rated(2, DINING, [3]),
      rated(3, ATTRACTION, [5, 5]),
      rated(4, ATTRACTION, [2]),
    ];
    const result = await recommend([1], places).execute(USER, "3");

    expect(result.map((p) => [p.id, p.reason])).toEqual([
      [2, "saved-category"],
      [3, "top-rated"],
      [4, "top-rated"],
    ]);
  });

  test("ไม่แนะนำ place ที่ตัวเองสร้าง หรือที่ยังไม่ approved", async () => {
    const places = [
      rated(1, DINING, [5], { createdBy: USER.id }),
      rated(2, DINING, [5], { status: "pending" }),
      rated(3, DINING, [1]),
    ];
    const result = await recommend([], places).execute(USER);
    expect(result.map((p) => p.id)).toEqual([3]);
  });
});
