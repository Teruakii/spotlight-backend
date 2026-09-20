class Review {
  constructor({ id, placeId, userId, rating, comment, createdAt, user }) {
    this.id = id;
    this.placeId = placeId;
    this.userId = userId;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
    this.author = user ? { firstName: user.firstName, lastName: user.lastName } : null;
  }

  isOwnedBy(userId) {
    return this.userId === userId;
  }
}

module.exports = Review;
