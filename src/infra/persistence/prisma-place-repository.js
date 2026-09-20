const PlaceRepository = require('../../domain/place/ports/repository');

const PLACE_INCLUDE = {
  category: true,
  images: true,
  transports: true,
  reviews: true,
};

class PrismaPlaceRepository extends PlaceRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findById(id) {
    return this.prisma.place.findUnique({ where: { id }, include: PLACE_INCLUDE });
  }

  async findAll(filters = {}) {
    return this.prisma.place.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: PLACE_INCLUDE,
    });
  }

  async create(data) {
    return this.prisma.place.create({ data });
  }

  async update(id, data) {
    return this.prisma.place.update({ where: { id }, data });
  }

  async delete(id) {
    return this.prisma.place.delete({ where: { id } });
  }
}

module.exports = PrismaPlaceRepository;