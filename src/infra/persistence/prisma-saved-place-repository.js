const SavedPlaceRepository = require('../../domain/saved-place/ports/repository');

const PLACE_INCLUDE = {
  category: true,
  images: true,
  transports: true,
  reviews: true,
};

class PrismaSavedPlaceRepository extends SavedPlaceRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async save(userId, placeId) {
    await this.prisma.savedPlace.upsert({
      where: { userId_placeId: { userId, placeId } },
      create: { userId, placeId },
      update: {},
    });
  }

  async remove(userId, placeId) {
    await this.prisma.savedPlace.deleteMany({ where: { userId, placeId } });
  }

  async findPlacesByUserId(userId) {
    const rows = await this.prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { place: { include: PLACE_INCLUDE } },
    });
    return rows.map((row) => row.place);
  }
}

module.exports = PrismaSavedPlaceRepository;
