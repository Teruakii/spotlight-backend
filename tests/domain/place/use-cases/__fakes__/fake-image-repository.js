class FakeImageRepository {
  constructor(seed = []) {
    this.rows = [...seed];
    this.nextId = seed.length ? Math.max(...seed.map((i) => i.id)) + 1 : 1;
  }

  async findById(id) {
    return this.rows.find((i) => i.id === id) || null;
  }

  async create(placeId, { imageUrl }) {
    const row = { id: this.nextId++, placeId, imageUrl };
    this.rows.push(row);
    return row;
  }

  async delete(id) {
    this.rows = this.rows.filter((i) => i.id !== id);
  }
}

module.exports = FakeImageRepository;
