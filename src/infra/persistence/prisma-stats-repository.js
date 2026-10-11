const StatsRepository = require('../../domain/admin/ports/stats-repository');

// Must produce the same keys as domain/admin/period.js bucketKey().
const BUCKET_FORMAT = { day: '%Y-%m-%d', month: '%Y-%m' };

function toCountMap(rows) {
  return new Map(rows.map((row) => [row.bucket, Number(row.count)]));
}

class PrismaStatsRepository extends StatsRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async countTotals() {
    const [places, reviews, users, pending] = await Promise.all([
      this.prisma.place.count({ where: { status: 'approved' } }),
      this.prisma.review.count(),
      this.prisma.user.count(),
      this.prisma.place.count({ where: { status: 'pending' } }),
    ]);
    return { places, reviews, users, pending };
  }

  async countSince(since) {
    const [places, reviews, users, activeUsers] = await Promise.all([
      this.prisma.place.count({ where: { createdAt: { gte: since } } }),
      this.prisma.review.count({ where: { createdAt: { gte: since } } }),
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.user.count({ where: { lastLoginAt: { gte: since } } }),
    ]);
    return { places, reviews, users, activeUsers };
  }

  async countViewsByBucket(since, unit) {
    const rows = await this.prisma.$queryRaw`
      SELECT DATE_FORMAT(created_at, ${BUCKET_FORMAT[unit]}) AS bucket, COUNT(*) AS count
      FROM place_views WHERE created_at >= ${since} GROUP BY bucket`;
    return toCountMap(rows);
  }

  async countReviewsByBucket(since, unit) {
    const rows = await this.prisma.$queryRaw`
      SELECT DATE_FORMAT(created_at, ${BUCKET_FORMAT[unit]}) AS bucket, COUNT(*) AS count
      FROM reviews WHERE created_at >= ${since} GROUP BY bucket`;
    return toCountMap(rows);
  }

  async categoryMix() {
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true, _count: { select: { places: { where: { status: 'approved' } } } } },
      orderBy: { name: 'asc' },
    });
    return categories.map((c) => ({ id: c.id, name: c.name, count: c._count.places }));
  }

  async recentActivity(limit) {
    const [places, reviews, reports] = await Promise.all([
      this.prisma.place.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, status: true, createdAt: true, creator: { select: { firstName: true } } },
      }),
      this.prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          rating: true,
          createdAt: true,
          place: { select: { id: true, name: true } },
          user: { select: { firstName: true } },
        },
      }),
      this.prisma.reviewReport.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { reason: true, createdAt: true, review: { select: { place: { select: { id: true, name: true } } } } },
      }),
    ]);

    return [
      ...places.map((p) => ({
        type: 'place_submitted',
        title: 'New place submitted',
        detail: `${p.name} · by ${p.creator.firstName}`,
        placeId: p.id,
        at: p.createdAt,
      })),
      ...reviews.map((r) => ({
        type: 'review_posted',
        title: `New ${r.rating}★ review`,
        detail: `${r.place.name} · by ${r.user.firstName}`,
        placeId: r.place.id,
        at: r.createdAt,
      })),
      ...reports.map((r) => ({
        type: 'review_reported',
        title: 'Review reported',
        detail: `${r.review.place.name} · ${r.reason}`,
        placeId: r.review.place.id,
        at: r.createdAt,
      })),
    ]
      .sort((a, b) => b.at - a.at)
      .slice(0, limit);
  }

  async recordView(placeId, userId) {
    await this.prisma.placeView.create({ data: { placeId, userId } });
  }
}

module.exports = PrismaStatsRepository;
