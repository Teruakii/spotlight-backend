const { resolvePeriod, toSeries, bucketKey } = require("../../../src/domain/admin/period");
const GetAdminStats = require("../../../src/domain/admin/use-cases/get-admin-stats");
const RecordPlaceView = require("../../../src/domain/admin/use-cases/record-place-view");
const GetPlaceById = require("../../../src/domain/place/use-cases/get-place-by-id");
const FakePlaceRepository = require("../place/use-cases/__fakes__/fake-place-repository");
const { makeRegularUser } = require("../place/use-cases/__fakes__/fake-users");

const NOW = new Date("2026-10-11T08:00:00Z");

describe("resolvePeriod", () => {
  test("7D: 7 วันรายวัน จบที่วันนี้ และเริ่มตอนเที่ยงคืน UTC ของ 6 วันก่อน", () => {
    const { unit, since, buckets } = resolvePeriod("7D", NOW);
    expect(unit).toBe("day");
    expect(buckets).toHaveLength(7);
    expect(buckets[0]).toEqual({ key: "2026-10-05", label: "5 Oct" });
    expect(buckets[6]).toEqual({ key: "2026-10-11", label: "11 Oct" });
    expect(since.toISOString()).toBe("2026-10-05T00:00:00.000Z");
  });

  test("30D ข้ามเดือนได้ถูกต้อง", () => {
    const { buckets } = resolvePeriod("30D", NOW);
    expect(buckets).toHaveLength(30);
    expect(buckets[0].key).toBe("2026-09-12");
  });

  test("12M: 12 เดือนรายเดือน ข้ามปีได้", () => {
    const { unit, since, buckets } = resolvePeriod("12M", NOW);
    expect(unit).toBe("month");
    expect(buckets.map((b) => b.key)).toEqual([
      "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04",
      "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10",
    ]);
    expect(buckets[0].label).toBe("Nov");
    expect(since.toISOString()).toBe("2025-11-01T00:00:00.000Z");
  });

  test("bucketKey ใช้เวลา UTC ไม่ใช่เวลาเครื่อง", () => {
    expect(bucketKey(new Date("2026-10-10T23:30:00Z"), "day")).toBe("2026-10-10");
  });

  test("toSeries เติม 0 ให้ช่วงที่ไม่มีข้อมูล", () => {
    const { buckets } = resolvePeriod("7D", NOW);
    expect(toSeries(buckets, new Map([["2026-10-11", 4], ["2026-10-06", 2]]))).toEqual([0, 2, 0, 0, 0, 0, 4]);
  });
});

describe("GetAdminStats", () => {
  const repo = {
    countTotals: async () => ({ places: 10, reviews: 40, users: 7, pending: 2 }),
    countSince: async () => ({ places: 1, reviews: 5, users: 2, activeUsers: 3 }),
    countViewsByBucket: async (since, unit) => new Map([[unit === "day" ? "2026-10-11" : "2026-10", 9]]),
    countReviewsByBucket: async () => new Map(),
    categoryMix: async () => [{ id: 1, name: "Dining", count: 4 }],
    recentActivity: async () => [],
  };

  test("รวมผลเป็น series ตามช่วงเวลา และค่าเริ่มต้นเป็น 30D", async () => {
    const stats = await new GetAdminStats(repo, () => NOW).execute(undefined);
    expect(stats.period).toBe("30D");
    expect(stats.series.labels).toHaveLength(30);
    expect(stats.series.visits.at(-1)).toBe(9);
    expect(stats.series.reviews.every((n) => n === 0)).toBe(true);
    expect(stats.totals.places).toBe(10);
  });

  test("12M ส่ง unit = month ให้ repository", async () => {
    const stats = await new GetAdminStats(repo, () => NOW).execute("12M");
    expect(stats.series.visits.at(-1)).toBe(9);
  });

  test("period ที่ไม่รู้จักต้อง throw 400", async () => {
    await expect(new GetAdminStats(repo, () => NOW).execute("1Y")).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("RecordPlaceView", () => {
  const OWNER = makeRegularUser({ id: 9 });
  const places = new FakePlaceRepository([
    { id: 1, createdBy: 9, categoryId: 1, name: "Live", status: "approved" },
    { id: 2, createdBy: 9, categoryId: 1, name: "Draft", status: "pending" },
  ]);

  function setup() {
    const views = [];
    const statsRepo = { recordView: async (placeId, userId) => views.push({ placeId, userId }) };
    return { views, useCase: new RecordPlaceView(statsRepo, new GetPlaceById(places)) };
  }

  test("นับ view ของ place ที่ approved พร้อม user (ถ้ามี)", async () => {
    const { views, useCase } = setup();
    await useCase.execute("1", null);
    await useCase.execute(1, OWNER);
    expect(views).toEqual([{ placeId: 1, userId: null }, { placeId: 1, userId: 9 }]);
  });

  test("เจ้าของเปิดดู place ที่ยัง pending ไม่นับเป็น view", async () => {
    const { views, useCase } = setup();
    await useCase.execute(2, OWNER);
    expect(views).toEqual([]);
  });

  test("place ที่คนทั่วไปมองไม่เห็นต้อง throw not found", async () => {
    const { useCase } = setup();
    await expect(useCase.execute(2, null)).rejects.toThrow(/not found/i);
  });
});
