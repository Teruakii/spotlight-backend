// Stores collections and items; resolves item.place from a FakePlaceRepository
// the way the Prisma include does.
class FakeCollectionRepository {
  constructor(placeRepository, { collections = [], items = [] } = {}) {
    this.placeRepository = placeRepository;
    this.collections = collections.map((c) => ({ isPrivate: true, description: null, ...c }));
    this.items = [...items];
    this.nextId = 500;
  }

  _withItems(collection) {
    const items = this.items
      .filter((i) => i.collectionId === collection.id)
      .sort((a, b) => a.day - b.day || a.position - b.position)
      .map((i) => ({ ...i, place: this.placeRepository.rows.find((p) => p.id === i.placeId) }));
    return { ...collection, items };
  }

  async findAllByUserId(userId) {
    return this.collections.filter((c) => c.userId === userId).map((c) => this._withItems(c));
  }

  async findById(id) {
    const collection = this.collections.find((c) => c.id === id);
    return collection ? this._withItems(collection) : null;
  }

  async create(data) {
    const row = { id: this.nextId++, isPrivate: true, description: null, ...data };
    this.collections.push(row);
    return this._withItems(row);
  }

  async update(id, data) {
    Object.assign(this.collections.find((c) => c.id === id), data);
  }

  async delete(id) {
    this.collections = this.collections.filter((c) => c.id !== id);
    this.items = this.items.filter((i) => i.collectionId !== id);
  }

  async addItem(collectionId, { placeId, day, startTime }) {
    const positions = this.items.filter((i) => i.collectionId === collectionId && i.day === day).map((i) => i.position);
    this.items.push({
      id: this.nextId++,
      collectionId,
      placeId,
      day,
      startTime,
      position: positions.length ? Math.max(...positions) + 1 : 0,
    });
  }

  async removeItem(itemId) {
    this.items = this.items.filter((i) => i.id !== itemId);
  }

  async replaceLayout(collectionId, rows) {
    for (const row of rows) {
      Object.assign(this.items.find((i) => i.id === row.id), row);
    }
  }
}

module.exports = FakeCollectionRepository;
