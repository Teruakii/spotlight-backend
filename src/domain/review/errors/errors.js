const AppError = require('../../shared/errors/app-errors');

class ReviewNotFoundError extends AppError {
  constructor() {
    super('Review not found', 404);
  }
}

class ForbiddenReviewActionError extends AppError {
  constructor() {
    super('You do not have permission to perform this action on this review', 403);
  }
}

class InvalidReviewDataError extends AppError {
  constructor(details) {
    const message = Array.isArray(details)
      ? details.map((d) => d.message).join(', ')
      : details;
    super(message, 400);
    this.details = details;
  }
}

module.exports = {
  ReviewNotFoundError,
  ForbiddenReviewActionError,
  InvalidReviewDataError,
};
