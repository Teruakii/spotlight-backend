const { z } = require('zod');
const {
  ReviewNotFoundError,
  ForbiddenReviewActionError,
  InvalidReviewDataError,
} = require('../errors/errors');
const Review = require('../entities/review');

const idSchema = z.coerce.number().int().positive();

const updateReviewInputSchema = z
  .object({
    rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    comment: z.string().trim().max(2000).nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

class UpdateReview {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(requester, id, input) {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      throw new InvalidReviewDataError('Invalid review id');
    }

    const record = await this.reviewRepository.findById(parsedId.data);
    if (!record) {
      throw new ReviewNotFoundError();
    }

    const review = new Review(record);
    if (!requester || !review.isOwnedBy(requester.id)) {
      throw new ForbiddenReviewActionError();
    }

    const validationResult = updateReviewInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new InvalidReviewDataError(details);
    }

    const updated = await this.reviewRepository.update(parsedId.data, validationResult.data);
    return new Review(updated);
  }
}

module.exports = UpdateReview;
