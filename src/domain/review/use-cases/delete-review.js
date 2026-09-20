const { z } = require('zod');
const {
  ReviewNotFoundError,
  ForbiddenReviewActionError,
  InvalidReviewDataError,
} = require('../errors/errors');
const Review = require('../entities/review');

const idSchema = z.coerce.number().int().positive();

class DeleteReview {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(requester, id) {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      throw new InvalidReviewDataError('Invalid review id');
    }

    const record = await this.reviewRepository.findById(parsedId.data);
    if (!record) {
      throw new ReviewNotFoundError();
    }

    const review = new Review(record);
    if (!requester || (!requester.hasPermission("review:manage_any") && !review.isOwnedBy(requester.id))) {
      throw new ForbiddenReviewActionError();
    }

    await this.reviewRepository.delete(parsedId.data);
    return true;
  }
}

module.exports = DeleteReview;
