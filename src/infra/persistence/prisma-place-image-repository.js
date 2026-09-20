const PlaceImageRepository = require('../../domain/place/ports/image-repository');

class PrismaPlaceImageRepository extends PlaceImageRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findById(id) {
    return this.prisma.placeImage.findUnique({ where: { id } });
  }

  async create(placeId, { imageUrl }) {
    return this.prisma.placeImage.create({ data: { placeId, imageUrl } });
  }

  async delete(id) {
    return this.prisma.placeImage.delete({ where: { id } });
  }
}

module.exports = PrismaPlaceImageRepository;
