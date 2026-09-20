const { z } = require('zod');
const { InvalidReviewDataError } = require('../errors/errors');
const Review = require('../entities/review');

const placeIdSchema = z.coerce.number().int().positive();

class ListReviewsForPlace {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(placeId) {
    const parsedPlaceId = placeIdSchema.safeParse(placeId);
    if (!parsedPlaceId.success) {
      throw new InvalidReviewDataError('Invalid place id');
    }

    const records = await this.reviewRepository.findByPlaceId(parsedPlaceId.data);
    return records.map((record) => new Review(record));
  }
}

module.exports = ListReviewsForPlace;
