class FakeSavedPlaceRepository {
  constructor(placeRepository, seed = []) {
    this.placeRepository = placeRepository;
    this.rows = [...seed];
  }

  async save(userId, placeId) {
    if (!this.rows.some((r) => r.userId === userId && r.placeId === placeId)) {
      this.rows.push({ userId, placeId });
    }
  }

  async remove(userId, placeId) {
    this.rows = this.rows.filter((r) => !(r.userId === userId && r.placeId === placeId));
  }

  async findPlacesByUserId(userId) {
    const ids = this.rows.filter((r) => r.userId === userId).map((r) => r.placeId);
    return this.placeRepository.rows.filter((p) => ids.includes(p.id));
  }
}

module.exports = FakeSavedPlaceRepository;
