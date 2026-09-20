const { z } = require('zod');
const { InvalidReviewDataError } = require('../errors/errors');
const { PlaceNotFoundError } = require('../../place/errors/errors');
const Place = require('../../place/entities/place');
const Review = require('../entities/review');

const placeIdSchema = z.coerce.number().int().positive();

const createReviewInputSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(2000).optional().nullable(),
});

class CreateReview {
  constructor(reviewRepository, placeRepository) {
    this.reviewRepository = reviewRepository;
    this.placeRepository = placeRepository;
  }

  async execute(reviewer, placeId, input) {
    const parsedPlaceId = placeIdSchema.safeParse(placeId);
    if (!parsedPlaceId.success) {
      throw new InvalidReviewDataError('Invalid place id');
    }

    const placeRecord = await this.placeRepository.findById(parsedPlaceId.data);
    if (!placeRecord || new Place(placeRecord).status !== 'approved') {
      throw new PlaceNotFoundError();
    }

    const validationResult = createReviewInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new InvalidReviewDataError(details);
    }

    const record = await this.reviewRepository.create({
      ...validationResult.data,
      placeId: parsedPlaceId.data,
      userId: reviewer.id,
    });

    return new Review(record);
  }
}

module.exports = CreateReview;
