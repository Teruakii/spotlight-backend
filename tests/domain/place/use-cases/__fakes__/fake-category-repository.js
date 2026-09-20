class FakeCategoryRepository {
  constructor(seed = []) {
    this.rows = [...seed];
    this.nextId = seed.length ? Math.max(...seed.map((c) => c.id)) + 1 : 1;
  }

  async findById(id) {
    return this.rows.find((c) => c.id === id) || null;
  }

  async findAll() {
    return [...this.rows].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findByName(name) {
    return this.rows.find((c) => c.name === name) || null;
  }

  async create(data) {
    const row = { id: this.nextId++, ...data };
    this.rows.push(row);
    return row;
  }

  async update(id, data) {
    const row = this.rows.find((c) => c.id === id);
    Object.assign(row, data);
    return row;
  }

  async delete(id) {
    this.rows = this.rows.filter((c) => c.id !== id);
  }

  async countPlacesUsingCategory(id) {
    return this._placesUsingCategory ? this._placesUsingCategory(id) : 0;
  }

  // helper สำหรับ test ที่ต้องจำลองว่ามี place ผูก category นี้อยู่
  __setPlacesUsingCategory(fn) {
    this._placesUsingCategory = fn;
  }
}

module.exports = FakeCategoryRepository;
