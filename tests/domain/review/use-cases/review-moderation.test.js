const {
  ReportReview,
  ListReportedReviews,
  ModerateReview,
  AlreadyReportedError,
} = require("../../../../src/domain/review/use-cases/review-moderation");
const { makeAdmin, makeRegularUser } = require("../../place/use-cases/__fakes__/fake-users");

const AUTHOR = makeRegularUser({ id: 2 });
const READER = makeRegularUser({ id: 3 });
const OTHER_READER = makeRegularUser({ id: 4 });
const ADMIN = makeAdmin();

function setup() {
  const reviews = [
    {
      id: 1,
      placeId: 10,
      userId: AUTHOR.id,
      rating: 1,
      comment: "Buy cheap watches at …",
      createdAt: new Date("2026-10-01"),
      user: { firstName: "Spam", lastName: "Bot" },
      place: { id: 10, name: "Sora Rooftop" },
    },
    {
      id: 2,
      placeId: 10,
      userId: AUTHOR.id,
      rating: 4,
      comment: "Nice view",
      createdAt: new Date("2026-10-02"),
      user: { firstName: "Spam", lastName: "Bot" },
      place: { id: 10, name: "Sora Rooftop" },
    },
  ];
  const reviewRepo = {
    rows: reviews,
    findById: async (id) => reviews.find((r) => r.id === id) || null,
    delete: async (id) => {
      reviewRepo.rows = reviewRepo.rows.filter((r) => r.id !== id);
    },
  };
  const reportRepo = {
    rows: [],
    nextId: 1,
    async create(data) {
      if (this.rows.some((r) => r.reviewId === data.reviewId && r.reporterId === data.reporterId)) {
        const err = new Error("Unique constraint failed");
        err.code = "P2002";
        throw err;
      }
      const row = { id: this.nextId++, status: "open", createdAt: new Date(Date.now() + this.nextId), ...data };
      this.rows.push(row);
      return row;
    },
    isDuplicateReportError: (err) => err.code === "P2002",
    async findOpen() {
      return this.rows
        .filter((r) => r.status === "open" && reviewRepo.rows.some((rv) => rv.id === r.reviewId))
        .map((r) => ({ ...r, review: reviewRepo.rows.find((rv) => rv.id === r.reviewId) }));
    },
    async dismissOpenForReview(reviewId, resolverId) {
      for (const r of this.rows) {
        if (r.reviewId === reviewId && r.status === "open") Object.assign(r, { status: "dismissed", resolvedById: resolverId });
      }
    },
  };
  return {
    reviewRepo,
    reportRepo,
    report: new ReportReview(reviewRepo, reportRepo),
    list: new ListReportedReviews(reportRepo),
    moderate: new ModerateReview(reviewRepo, reportRepo),
  };
}

describe("Review moderation", () => {
  test("รายงานรีวิวได้ และรายการรวมตามรีวิว เรียงจากถูกรายงานมากสุด", async () => {
    const { report, list } = setup();
    await report.execute(READER, "1", { reason: "spam" });
    await report.execute(OTHER_READER, 1, { reason: "offensive", details: "rude" });
    await report.execute(READER, 2, { reason: "misleading" });

    const queue = await list.execute();
    expect(queue.map((g) => [g.review.id, g.reportCount])).toEqual([
      [1, 2],
      [2, 1],
    ]);
    expect(queue[0].reasons).toEqual({ spam: 1, offensive: 1 });
    expect(queue[0].details).toEqual(["rude"]);
    expect(queue[0].review.place.name).toBe("Sora Rooftop");
  });

  test("รายงานซ้ำได้ 409 และรายงานรีวิวของตัวเองไม่ได้", async () => {
    const { report } = setup();
    await report.execute(READER, 1, { reason: "spam" });
    await expect(report.execute(READER, 1, { reason: "other" })).rejects.toThrow(AlreadyReportedError);
    await expect(report.execute(AUTHOR, 1, { reason: "spam" })).rejects.toThrow(/permission/i);
  });

  test("เหตุผลต้องอยู่ในรายการ และรีวิวต้องมีอยู่จริง", async () => {
    const { report } = setup();
    await expect(report.execute(READER, 1, { reason: "boring" })).rejects.toThrow(/reason must be one of/i);
    await expect(report.execute(READER, 99, { reason: "spam" })).rejects.toThrow(/not found/i);
  });

  test("dismiss ปิด report ที่ open ทั้งหมดของรีวิวนั้น บันทึกคนปิด และรีวิวยังอยู่", async () => {
    const { report, moderate, list, reportRepo, reviewRepo } = setup();
    await report.execute(READER, 1, { reason: "spam" });
    await report.execute(READER, 2, { reason: "spam" });
    await moderate.execute(ADMIN, 1, { action: "dismiss" });

    expect((await list.execute()).map((g) => g.review.id)).toEqual([2]);
    expect(reportRepo.rows.find((r) => r.reviewId === 1)).toMatchObject({ status: "dismissed", resolvedById: ADMIN.id });
    expect(reviewRepo.rows.map((r) => r.id)).toEqual([1, 2]);
  });

  test("remove ลบรีวิวออก และหายจากคิว", async () => {
    const { report, moderate, list, reviewRepo } = setup();
    await report.execute(READER, 1, { reason: "spam" });
    await moderate.execute(ADMIN, 1, { action: "remove" });

    expect(reviewRepo.rows.map((r) => r.id)).toEqual([2]);
    expect(await list.execute()).toEqual([]);
  });

  test("action ที่ไม่รู้จักต้อง throw", async () => {
    const { moderate } = setup();
    await expect(moderate.execute(ADMIN, 1, { action: "ban" })).rejects.toThrow();
  });
});
