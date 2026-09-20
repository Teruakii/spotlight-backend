const STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

class Place {
  constructor({
    id,
    createdBy,
    categoryId,
    name,
    description,
    address,
    latitude,
    longitude,
    openingHours,
    priceInfo,
    priceLevel,
    bestTime,
    duration,
    status = STATUS.PENDING,
    createdAt,
    updatedAt,
    category,
    images,
    transports,
    reviews,
  }) {
    this.id = id;
    this.createdBy = createdBy;
    this.categoryId = categoryId;
    this.name = name;
    this.description = description;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
    this.openingHours = openingHours;
    this.priceInfo = priceInfo;
    this.priceLevel = priceLevel;
    this.bestTime = bestTime;
    this.duration = duration;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.category = category || null;
    this.images = images || [];
    this.transports = transports || [];

    const ratedReviews = reviews || [];
    this.reviewCount = ratedReviews.length;
    this.rating = ratedReviews.length
      ? Math.round((ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratedReviews.length) * 10) / 10
      : null;
  }

  hasNoPriceInfo() {
    return !this.priceInfo;
  }
  isFreeEntry() {
    return this.hasNoPriceInfo();
  }

  hasPriceLevel() {
    return this.priceLevel !== null && this.priceLevel !== undefined;
  }

  isApproved() {
    return this.status === STATUS.APPROVED;
  }

  isPending() {
    return this.status === STATUS.PENDING;
  }

  isRejected() {
    return this.status === STATUS.REJECTED;
  }

  isOwnedBy(userId) {
    return this.createdBy === userId;
  }
}

Place.STATUS = STATUS;

module.exports = Place;
