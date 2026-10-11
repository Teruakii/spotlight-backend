const { z } = require('zod');
const { InvalidReviewDataError } = require('../errors/errors');
const { toDetailedReview } = require('../detailed-review');

const placeIdSchema = z.coerce.number().int().positive();

class ListDetailedReviewsForPlace {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(placeId, viewer = null) {
    const parsedPlaceId = placeIdSchema.safeParse(placeId);
    if (!parsedPlaceId.success) {
      throw new InvalidReviewDataError('Invalid place id');
    }

    const viewerId = viewer ? viewer.id : null;
    const records = await this.reviewRepository.findDetailedByPlaceId(parsedPlaceId.data, viewerId);
    return records.map((record) => toDetailedReview(record, viewerId));
  }
}

module.exports = ListDetailedReviewsForPlace;
