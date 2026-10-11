const ReviewRepository = require('../../domain/review/ports/repository');


class PrismaReviewRepository extends ReviewRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findById(id) {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async findByPlaceId(placeId) {
    return this.prisma.review.findMany({
      where: { placeId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  async findByUserId(userId) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        place: { select: { id: true, name: true, images: { select: { imageUrl: true }, take: 1 } } },
      },
    });
  }

  _detailedInclude(viewerId) {
    return {
      user: { select: { firstName: true, lastName: true } },
      images: { select: { id: true, imageUrl: true }, orderBy: { id: 'asc' } },
      _count: { select: { helpfulVotes: true } },
      helpfulVotes: { where: { userId: viewerId ?? -1 }, select: { userId: true } },
    };
  }

  async findDetailedByPlaceId(placeId, viewerId) {
    return this.prisma.review.findMany({
      where: { placeId },
      orderBy: { createdAt: 'desc' },
      include: this._detailedInclude(viewerId),
    });
  }

  async createDetailed(data, imageUrls) {
    return this.prisma.review.create({
      data: { ...data, images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) } },
      include: this._detailedInclude(data.userId),
    });
  }

  async addHelpfulVote(reviewId, userId) {
    await this.prisma.reviewHelpfulVote.upsert({
      where: { reviewId_userId: { reviewId, userId } },
      create: { reviewId, userId },
      update: {},
    });
  }

  async removeHelpfulVote(reviewId, userId) {
    await this.prisma.reviewHelpfulVote.deleteMany({ where: { reviewId, userId } });
  }

  async create(data) {
    return this.prisma.review.create({ data });
  }

  async update(id, data) {
    return this.prisma.review.update({ where: { id }, data });
  }

  async delete(id) {
    return this.prisma.review.delete({ where: { id } });
  }
}

module.exports = PrismaReviewRepository;