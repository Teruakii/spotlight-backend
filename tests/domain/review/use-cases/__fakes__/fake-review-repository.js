class FakeReviewRepository {
  constructor(seed = []) {
    this.rows = seed.map((r) => ({ images: [], ...r }));
    this.votes = [];
    this.nextId = 100;
  }

  async findById(id) {
    return this.rows.find((r) => r.id === id) || null;
  }

  _detailed(row, viewerId) {
    const votes = this.votes.filter((v) => v.reviewId === row.id);
    return {
      ...row,
      _count: { helpfulVotes: votes.length },
      helpfulVotes: votes.filter((v) => v.userId === viewerId),
    };
  }

  async findDetailedByPlaceId(placeId, viewerId) {
    return this.rows.filter((r) => r.placeId === placeId).map((r) => this._detailed(r, viewerId));
  }

  async createDetailed(data, imageUrls) {
    const row = {
      id: this.nextId++,
      comment: null,
      experienceRating: null,
      valueRating: null,
      accessRating: null,
      atmosphereRating: null,
      createdAt: new Date(),
      ...data,
      images: imageUrls.map((imageUrl, i) => ({ id: i + 1, imageUrl })),
    };
    this.rows.push(row);
    return this._detailed(row, data.userId);
  }

  async addHelpfulVote(reviewId, userId) {
    if (!this.votes.some((v) => v.reviewId === reviewId && v.userId === userId)) {
      this.votes.push({ reviewId, userId });
    }
  }

  async removeHelpfulVote(reviewId, userId) {
    this.votes = this.votes.filter((v) => !(v.reviewId === reviewId && v.userId === userId));
  }
}

module.exports = FakeReviewRepository;
