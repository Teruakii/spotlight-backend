const ReviewReportRepository = require('../../domain/review/ports/report-repository');

class PrismaReviewReportRepository extends ReviewReportRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async create(data) {
    return this.prisma.reviewReport.create({ data });
  }

  isDuplicateReportError(err) {
    return err.code === 'P2002';
  }

  async findOpen() {
    return this.prisma.reviewReport.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
      include: {
        review: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            place: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async dismissOpenForReview(reviewId, resolverId) {
    await this.prisma.reviewReport.updateMany({
      where: { reviewId, status: 'open' },
      data: { status: 'dismissed', resolvedAt: new Date(), resolvedById: resolverId },
    });
  }
}

module.exports = PrismaReviewReportRepository;
