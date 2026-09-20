class FakeTransportRepository {
  constructor() {
    this.rows = [];
    this.nextId = 1;
  }

  async create(placeId, { method, detail }) {
    const row = { id: this.nextId++, placeId, method, detail };
    this.rows.push(row);
    return row;
  }
}

module.exports = FakeTransportRepository;
