class FakeUserRepository {
  constructor(seed = []) {
    this.rows = [...seed];
    this.nextId = seed.length ? Math.max(...seed.map((u) => u.id)) + 1 : 1;
  }

  async findById(id) {
    return this.rows.find((u) => u.id === id) || null;
  }

  async findByEmail(email) {
    return this.rows.find((u) => u.email === email) || null;
  }

  async create(data) {
    if (this.rows.some((u) => u.email === data.email)) {
      const err = new Error("Unique constraint failed");
      err.code = "P2002";
      err.meta = { target: ["email"] };
      throw err;
    }
    const row = { id: this.nextId++, role: "user", permissions: [], isSuspended: false, ...data };
    this.rows.push(row);
    return row;
  }

  isDuplicateEmailError(err) {
    return err.code === "P2002";
  }
}

module.exports = FakeUserRepository;
