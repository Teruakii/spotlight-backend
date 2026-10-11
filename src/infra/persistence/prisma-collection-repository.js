const CollectionRepository = require('../../domain/collection/ports/repository');

const ITEM_ORDER = [{ day: 'asc' }, { position: 'asc' }];

const DETAIL_INCLUDE = {
  items: {
    orderBy: ITEM_ORDER,
    include: {
      place: {
        include: {
          category: true,
          images: { select: { imageUrl: true }, take: 1 },
          reviews: { select: { rating: true } },
        },
      },
    },
  },
};

class PrismaCollectionRepository extends CollectionRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findAllByUserId(userId) {
    return this.prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        items: {
          orderBy: ITEM_ORDER,
          select: { day: true, place: { select: { images: { select: { imageUrl: true }, take: 1 } } } },
        },
      },
    });
  }

  async findById(id) {
    return this.prisma.collection.findUnique({ where: { id }, include: DETAIL_INCLUDE });
  }

  async create(data) {
    return this.prisma.collection.create({ data, include: DETAIL_INCLUDE });
  }

  async update(id, data) {
    return this.prisma.collection.update({ where: { id }, data });
  }

  async delete(id) {
    await this.prisma.collection.delete({ where: { id } });
  }

  async addItem(collectionId, { placeId, day, startTime }) {
    await this.prisma.$transaction(async (tx) => {
      const last = await tx.collectionItem.aggregate({
        where: { collectionId, day },
        _max: { position: true },
      });
      await tx.collectionItem.create({
        data: { collectionId, placeId, day, startTime, position: (last._max.position ?? -1) + 1 },
      });
      await tx.collection.update({ where: { id: collectionId }, data: { updatedAt: new Date() } });
    });
  }

  async removeItem(itemId) {
    await this.prisma.collectionItem.delete({ where: { id: itemId } });
  }

  async replaceLayout(collectionId, rows) {
    await this.prisma.$transaction([
      ...rows.map((row) =>
        this.prisma.collectionItem.update({
          where: { id: row.id },
          data: { day: row.day, position: row.position, startTime: row.startTime },
        }),
      ),
      this.prisma.collection.update({ where: { id: collectionId }, data: { updatedAt: new Date() } }),
    ]);
  }
}

module.exports = PrismaCollectionRepository;
