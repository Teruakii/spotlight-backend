const { z } = require('zod');
const { InvalidReviewDataError } = require('../errors/errors');
const { PlaceNotFoundError } = require('../../place/errors/errors');
const Place = require('../../place/entities/place');
const { toDetailedReview } = require('../detailed-review');

const MAX_IMAGES = 4;

const placeIdSchema = z.coerce.number().int().positive();
const score = (label) =>
  z.coerce
    .number()
    .int()
    .min(1, `${label} must be between 1 and 5`)
    .max(5, `${label} must be between 1 and 5`);

const inputSchema = z.object({
  rating: score('Rating'),
  comment: z.string().trim().max(2000).optional().nullable(),
  experienceRating: score('Experience rating').optional().nullable(),
  valueRating: score('Value rating').optional().nullable(),
  accessRating: score('Access rating').optional().nullable(),
  atmosphereRating: score('Atmosphere rating').optional().nullable(),
  imageUrls: z
    .array(z.string().trim().url('Each image must be a valid URL').max(500).refine(
      (url) => /^https?:\/\//i.test(url),
      'Image URLs must start with http:// or https://',
    ))
    .max(MAX_IMAGES, `At most ${MAX_IMAGES} photos per review`)
    .optional()
    .default([]),
});

class CreateDetailedReview {
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
    if (!placeRecord || !new Place(placeRecord).isApproved()) {
      throw new PlaceNotFoundError();
    }

    const validationResult = inputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new InvalidReviewDataError(details);
    }

    const { imageUrls, ...fields } = validationResult.data;
    const record = await this.reviewRepository.createDetailed(
      { ...fields, placeId: parsedPlaceId.data, userId: reviewer.id },
      imageUrls,
    );
    return toDetailedReview(record, reviewer.id);
  }
}

module.exports = CreateDetailedReview;
