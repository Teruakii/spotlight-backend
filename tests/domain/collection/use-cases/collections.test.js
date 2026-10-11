const {
  ListMyCollections,
  CreateCollection,
  GetCollection,
  UpdateCollection,
  DeleteCollection,
  AddCollectionItem,
  RemoveCollectionItem,
  SetCollectionLayout,
} = require("../../../../src/domain/collection/use-cases/collection-use-cases");
const { planLayout } = require("../../../../src/domain/collection/entities/collection");
const GetPlaceById = require("../../../../src/domain/place/use-cases/get-place-by-id");
const FakePlaceRepository = require("../../place/use-cases/__fakes__/fake-place-repository");
const FakeCollectionRepository = require("./__fakes__/fake-collection-repository");
const { makeRegularUser } = require("../../place/use-cases/__fakes__/fake-users");

const OWNER = makeRegularUser({ id: 2 });
const STRANGER = makeRegularUser({ id: 3 });

const place = (id, extra = {}) => ({ id, createdBy: 9, categoryId: 1, name: `Place ${id}`, status: "approved", ...extra });

function setup() {
  const placeRepo = new FakePlaceRepository([place(1), place(2), place(3), place(4, { status: "pending" })]);
  const repo = new FakeCollectionRepository(placeRepo, {
    collections: [
      { id: 10, userId: OWNER.id, name: "Bangkok Weekend", isPrivate: true },
      { id: 11, userId: OWNER.id, name: "Public picks", isPrivate: false },
    ],
    items: [
      { id: 100, collectionId: 10, placeId: 1, day: 1, position: 0, startTime: "09:00" },
      { id: 101, collectionId: 10, placeId: 2, day: 1, position: 1, startTime: null },
      { id: 102, collectionId: 11, placeId: 4, day: 1, position: 0, startTime: null },
      { id: 103, collectionId: 11, placeId: 3, day: 1, position: 1, startTime: null },
    ],
  });
  const getPlaceById = new GetPlaceById(placeRepo);
  return {
    repo,
    list: new ListMyCollections(repo),
    create: new CreateCollection(repo),
    get: new GetCollection(repo),
    update: new UpdateCollection(repo),
    remove: new DeleteCollection(repo),
    addItem: new AddCollectionItem(repo, getPlaceById),
    removeItem: new RemoveCollectionItem(repo),
    layout: new SetCollectionLayout(repo),
  };
}

describe("planLayout", () => {
  test("ลำดับใน array กลายเป็น position แยกตามวัน", () => {
    const { rows } = planLayout([1, 2, 3], [
      { id: 2, day: 1 },
      { id: 3, day: 2, startTime: "13:30" },
      { id: 1, day: 1 },
    ]);
    expect(rows).toEqual([
      { id: 2, day: 1, position: 0, startTime: null },
      { id: 3, day: 2, position: 0, startTime: "13:30" },
      { id: 1, day: 1, position: 1, startTime: null },
    ]);
  });

  test("ต้องมีทุก item ครบ ไม่ซ้ำ และไม่มี item แปลกปลอม", () => {
    expect(planLayout([1, 2], [{ id: 1, day: 1 }]).error).toMatch(/every item/);
    expect(planLayout([1, 2], [{ id: 1, day: 1 }, { id: 1, day: 1 }]).error).toMatch(/more than once/);
    expect(planLayout([1], [{ id: 9, day: 1 }]).error).toMatch(/not in this collection/);
  });

  test("วันต้องอยู่ในช่วง 1-30 และเวลาต้องเป็น HH:MM", () => {
    expect(planLayout([1], [{ id: 1, day: 0 }]).error).toMatch(/Day/);
    expect(planLayout([1], [{ id: 1, day: 31 }]).error).toMatch(/Day/);
    expect(planLayout([1], [{ id: 1, day: 1, startTime: "25:00" }]).error).toMatch(/HH:MM/);
  });
});

describe("Collections", () => {
  test("list แสดงสรุปจำนวนสถานที่และจำนวนวัน เฉพาะของตัวเอง", async () => {
    const { list } = setup();
    const mine = await list.execute(OWNER);
    expect(mine.find((c) => c.id === 10)).toMatchObject({ name: "Bangkok Weekend", itemCount: 2, dayCount: 1 });
    expect(await list.execute(STRANGER)).toEqual([]);
  });

  test("สร้าง collection ใหม่เป็น private โดยค่าเริ่มต้น", async () => {
    const { create } = setup();
    const created = await create.execute(OWNER, { name: "Hidden gems" });
    expect(created).toMatchObject({ name: "Hidden gems", isPrivate: true, userId: OWNER.id, items: [] });
  });

  test("ห้ามตั้ง userId เองตอนสร้าง", async () => {
    const { create } = setup();
    await expect(create.execute(OWNER, { name: "x", userId: STRANGER.id })).rejects.toThrow();
  });

  test("collection private: คนอื่นเห็นเป็น not found, เจ้าของเห็นได้", async () => {
    const { get } = setup();
    await expect(get.execute(10, STRANGER)).rejects.toThrow(/not found/i);
    await expect(get.execute(10, null)).rejects.toThrow(/not found/i);
    const own = await get.execute("10", OWNER);
    expect(own.items.map((i) => i.place.id)).toEqual([1, 2]);
  });

  test("collection public: คนอื่นเห็นได้แต่ไม่เห็น place ที่ยังไม่ approved; เจ้าของเห็นทั้งหมด", async () => {
    const { get } = setup();
    expect((await get.execute(11, null)).items.map((i) => i.place.id)).toEqual([3]);
    expect((await get.execute(11, OWNER)).items.map((i) => i.place.id)).toEqual([4, 3]);
  });

  test("คนอื่นแก้ ลบ หรือเพิ่ม item ใน collection ที่ไม่ใช่ของตัวเองไม่ได้ (not found)", async () => {
    const { update, remove, addItem, repo } = setup();
    await expect(update.execute(STRANGER, 11, { name: "hacked" })).rejects.toThrow(/not found/i);
    await expect(remove.execute(STRANGER, 11)).rejects.toThrow(/not found/i);
    await expect(addItem.execute(STRANGER, 11, { placeId: 1 })).rejects.toThrow(/not found/i);
    expect(repo.collections.find((c) => c.id === 11).name).toBe("Public picks");
  });

  test("เพิ่ม place ต่อท้ายวัน และเพิ่มซ้ำไม่ได้", async () => {
    const { addItem } = setup();
    const updated = await addItem.execute(OWNER, 10, { placeId: 3, startTime: "17:00" });
    expect(updated.items.map((i) => [i.place.id, i.position, i.startTime])).toEqual([
      [1, 0, "09:00"],
      [2, 1, null],
      [3, 2, "17:00"],
    ]);
    await expect(addItem.execute(OWNER, 10, { placeId: 3 })).rejects.toThrow(/already/i);
  });

  test("เพิ่ม place ที่ยังไม่ approved ของคนอื่นไม่ได้", async () => {
    const { addItem } = setup();
    await expect(addItem.execute(OWNER, 10, { placeId: 4 })).rejects.toThrow(/not found/i);
  });

  test("จัด layout ใหม่: สลับลำดับและย้ายไปวันที่ 2", async () => {
    const { layout } = setup();
    const updated = await layout.execute(OWNER, 10, {
      items: [
        { id: 101, day: 1 },
        { id: 100, day: 2, startTime: "10:00" },
      ],
    });
    expect(updated.items.map((i) => [i.id, i.day, i.position, i.startTime])).toEqual([
      [101, 1, 0, null],
      [100, 2, 0, "10:00"],
    ]);
  });

  test("layout ที่ไม่ครบต้อง throw และไม่เขียนอะไรลงไป", async () => {
    const { layout, repo } = setup();
    await expect(layout.execute(OWNER, 10, { items: [{ id: 100, day: 2 }] })).rejects.toThrow(/every item/);
    expect(repo.items.find((i) => i.id === 100).day).toBe(1);
  });

  test("ลบ item ที่ไม่ได้อยู่ใน collection นี้ไม่ได้", async () => {
    const { removeItem } = setup();
    await expect(removeItem.execute(OWNER, 10, 103)).rejects.toThrow(/item not found/i);
    const updated = await removeItem.execute(OWNER, 10, 100);
    expect(updated.items.map((i) => i.id)).toEqual([101]);
  });
});
