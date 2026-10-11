class ReviewReportRepository {
  // Throws an error recognised by isDuplicateReportError when the reporter
  // already reported this review.
  async create(data) {
    throw new Error('ReviewReportRepository.create() must be implemented');
  }

  isDuplicateReportError(err) {
    throw new Error('ReviewReportRepository.isDuplicateReportError() must be implemented');
  }

  // Open reports with their review (author + place), newest first.
  async findOpen() {
    throw new Error('ReviewReportRepository.findOpen() must be implemented');
  }

  async dismissOpenForReview(reviewId, resolverId) {
    throw new Error('ReviewReportRepository.dismissOpenForReview() must be implemented');
  }
}

module.exports = ReviewReportRepository;
