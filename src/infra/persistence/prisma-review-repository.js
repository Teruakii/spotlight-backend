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