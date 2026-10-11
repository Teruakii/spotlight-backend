const CreateDetailedReview = require("../../../../src/domain/review/use-cases/create-detailed-review");
const ListDetailedReviewsForPlace = require("../../../../src/domain/review/use-cases/list-detailed-reviews-for-place");
const SetReviewHelpful = require("../../../../src/domain/review/use-cases/set-review-helpful");
const FakePlaceRepository = require("../../place/use-cases/__fakes__/fake-place-repository");
const FakeReviewRepository = require("./__fakes__/fake-review-repository");
const { makeRegularUser } = require("../../place/use-cases/__fakes__/fake-users");

const AUTHOR = makeRegularUser({ id: 2 });
const READER = makeRegularUser({ id: 3 });
const APPROVED = { id: 10, createdBy: 9, categoryId: 1, name: "Wat Pho", status: "approved" };
const PENDING = { id: 11, createdBy: 9, categoryId: 1, name: "Hidden", status: "pending" };
const EXISTING = { id: 1, placeId: 10, userId: AUTHOR.id, rating: 4, comment: "Nice" };

function setup() {
  const placeRepo = new FakePlaceRepository([APPROVED, PENDING]);
  const reviewRepo = new FakeReviewRepository([EXISTING]);
  return {
    reviewRepo,
    create: new CreateDetailedReview(reviewRepo, placeRepo),
    list: new ListDetailedReviewsForPlace(reviewRepo),
    helpful: new SetReviewHelpful(reviewRepo),
  };
}

describe("CreateDetailedReview", () => {
  test("สร้างรีวิวพร้อมคะแนนย่อยและรูป", async () => {
    const { create } = setup();
    const review = await create.execute(READER, "10", {
      rating: 5,
      comment: "Wonderful",
      experienceRating: 5,
      valueRating: 4,
      imageUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    });

    expect(review.rating).toBe(5);
    expect(review.subRatings).toEqual({ experience: 5, value: 4, access: null, atmosphere: null });
    expect(review.images.map((i) => i.imageUrl)).toEqual(["https://example.com/a.jpg", "https://example.com/b.jpg"]);
    expect(review.helpfulCount).toBe(0);
  });

  test("ไม่ส่งคะแนนย่อยและรูปมาก็สร้างได้", async () => {
    const { create } = setup();
    const review = await create.execute(READER, 10, { rating: 3 });
    expect(review.images).toEqual([]);
    expect(review.subRatings.experience).toBeNull();
  });

  test("คะแนนย่อยนอกช่วง 1-5 ต้อง throw", async () => {
    const { create } = setup();
    await expect(create.execute(READER, 10, { rating: 4, valueRating: 6 })).rejects.toThrow(/value rating/i);
  });

  test("รูปเกิน 4 รูป หรือ URL ไม่ใช่ http(s) ต้อง throw", async () => {
    const { create } = setup();
    const five = Array.from({ length: 5 }, (_, i) => `https://example.com/${i}.jpg`);
    await expect(create.execute(READER, 10, { rating: 4, imageUrls: five })).rejects.toThrow(/at most 4/i);
    await expect(
      create.execute(READER, 10, { rating: 4, imageUrls: ["javascript:alert(1)"] }),
    ).rejects.toThrow();
  });

  test("รีวิว place ที่ยังไม่ approved ไม่ได้", async () => {
    const { create } = setup();
    await expect(create.execute(READER, 11, { rating: 4 })).rejects.toThrow(/not found/i);
  });
});

describe("Helpful votes", () => {
  test("กด helpful แล้วนับเพิ่ม กดซ้ำไม่นับซ้ำ และเห็นว่าตัวเองกดแล้ว", async () => {
    const { helpful, list } = setup();
    await helpful.execute(READER, "1", true);
    await helpful.execute(READER, "1", true);

    const [asReader] = await list.execute(10, READER);
    expect(asReader.helpfulCount).toBe(1);
    expect(asReader.helpfulByMe).toBe(true);

    const [anonymous] = await list.execute(10, null);
    expect(anonymous.helpfulByMe).toBe(false);
  });

  test("ยกเลิก helpful แล้วนับลด และยกเลิกซ้ำไม่ error", async () => {
    const { helpful, list } = setup();
    await helpful.execute(READER, 1, true);
    await helpful.execute(READER, 1, false);
    await helpful.execute(READER, 1, false);

    const [review] = await list.execute(10, READER);
    expect(review.helpfulCount).toBe(0);
  });

  test("ผู้เขียนกด helpful ให้รีวิวตัวเองไม่ได้", async () => {
    const { helpful, reviewRepo } = setup();
    await expect(helpful.execute(AUTHOR, 1, true)).rejects.toThrow(/permission/i);
    expect(reviewRepo.votes).toHaveLength(0);
  });

  test("รีวิวที่ไม่มีอยู่ต้อง throw not found", async () => {
    const { helpful } = setup();
    await expect(helpful.execute(READER, 999, true)).rejects.toThrow(/not found/i);
  });
});
