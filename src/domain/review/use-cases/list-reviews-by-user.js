class ListReviewsByUser {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(user) {
    const records = await this.reviewRepository.findByUserId(user.id);
    return records.map((record) => ({
      id: record.id,
      rating: record.rating,
      comment: record.comment,
      createdAt: record.createdAt,
      place: {
        id: record.place.id,
        name: record.place.name,
        imageUrl: record.place.images[0]?.imageUrl ?? null,
      },
    }));
  }
}

module.exports = ListReviewsByUser;
