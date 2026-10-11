const { z } = require('zod');
const {
  ReviewNotFoundError,
  ForbiddenReviewActionError,
  InvalidReviewDataError,
} = require('../errors/errors');
const Review = require('../entities/review');

const idSchema = z.coerce.number().int().positive();

// Marks (helpful = true) or unmarks a review as helpful. Both directions are
// idempotent. Authors cannot vote on their own review.
class SetReviewHelpful {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(voter, reviewId, helpful) {
    const parsedId = idSchema.safeParse(reviewId);
    if (!parsedId.success) {
      throw new InvalidReviewDataError('Invalid review id');
    }

    const record = await this.reviewRepository.findById(parsedId.data);
    if (!record) {
      throw new ReviewNotFoundError();
    }
    if (new Review(record).isOwnedBy(voter.id)) {
      throw new ForbiddenReviewActionError();
    }

    if (helpful) {
      await this.reviewRepository.addHelpfulVote(parsedId.data, voter.id);
    } else {
      await this.reviewRepository.removeHelpfulVote(parsedId.data, voter.id);
    }
  }
}

module.exports = SetReviewHelpful;
