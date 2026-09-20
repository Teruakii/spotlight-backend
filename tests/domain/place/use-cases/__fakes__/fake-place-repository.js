class FakePlaceRepository {
  constructor(seed = []) {
    this.rows = [...seed];
    this.nextId = seed.length ? Math.max(...seed.map((p) => p.id)) + 1 : 1;
  }

  async findById(id) {
    return this.rows.find((p) => p.id === id) || null;
  }

  async findAll(where = {}) {
    return this.rows.filter((p) =>
      Object.entries(where).every(([key, value]) => p[key] === value),
    );
  }

  async create(data) {
    const row = {
      id: this.nextId++,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.rows.push(row);
    return row;
  }

  async update(id, data) {
    const row = this.rows.find((p) => p.id === id);
    Object.assign(row, data);
    return row;
  }

  async delete(id) {
    this.rows = this.rows.filter((p) => p.id !== id);
  }
}

module.exports = FakePlaceRepository;
