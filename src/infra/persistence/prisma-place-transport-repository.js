const PlaceTransportRepository = require('../../domain/place/ports/transport-repository');

class PrismaPlaceTransportRepository extends PlaceTransportRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async create(placeId, { method, detail }) {
    return this.prisma.placeTransport.create({ data: { placeId, method, detail } });
  }
}

module.exports = PrismaPlaceTransportRepository;
