const { z } = require('zod');
const AppError = require('../../shared/errors/app-errors');
const {
  ReviewNotFoundError,
  ForbiddenReviewActionError,
  InvalidReviewDataError,
} = require('../errors/errors');
const Review = require('../entities/review');

const REASONS = ['spam', 'offensive', 'misleading', 'other'];

const idSchema = z.coerce.number().int().positive();
const reportSchema = z
  .object({
    reason: z.enum(REASONS, { errorMap: () => ({ message: `Reason must be one of ${REASONS.join(', ')}` }) }),
    details: z.string().trim().max(1000).optional().nullable(),
  })
  .strict();
const moderationSchema = z.object({ action: z.enum(['dismiss', 'remove']) }).strict();

class AlreadyReportedError extends AppError {
  constructor() {
    super('You have already reported this review', 409);
  }
}

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new InvalidReviewDataError(
      result.error.errors.map((err) => ({ field: err.path.join('.'), message: err.message })),
    );
  }
  return result.data;
}

async function loadReview(reviewRepository, rawId) {
  const id = idSchema.safeParse(rawId);
  if (!id.success) throw new InvalidReviewDataError('Invalid review id');
  const record = await reviewRepository.findById(id.data);
  if (!record) throw new ReviewNotFoundError();
  return new Review(record);
}

class ReportReview {
  constructor(reviewRepository, reportRepository) {
    this.reviewRepository = reviewRepository;
    this.reportRepository = reportRepository;
  }

  async execute(reporter, reviewId, input) {
    const review = await loadReview(this.reviewRepository, reviewId);
    if (review.isOwnedBy(reporter.id)) throw new ForbiddenReviewActionError();
    const { reason, details } = parse(reportSchema, input);

    try {
      const report = await this.reportRepository.create({
        reviewId: review.id,
        reporterId: reporter.id,
        reason,
        details: details || null,
      });
      return { id: report.id, reviewId: review.id, reason, status: report.status };
    } catch (err) {
      if (this.reportRepository.isDuplicateReportError(err)) throw new AlreadyReportedError();
      throw err;
    }
  }
}

// Open reports grouped per review, most reported first.
class ListReportedReviews {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async execute() {
    const reports = await this.reportRepository.findOpen();
    const byReview = new Map();
    for (const report of reports) {
      const { review } = report;
      if (!byReview.has(review.id)) {
        byReview.set(review.id, {
          review: {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            author: { firstName: review.user.firstName, lastName: review.user.lastName },
            place: { id: review.place.id, name: review.place.name },
          },
          reportCount: 0,
          reasons: {},
          details: [],
          latestAt: report.createdAt,
        });
      }
      const group = byReview.get(review.id);
      group.reportCount += 1;
      group.reasons[report.reason] = (group.reasons[report.reason] || 0) + 1;
      if (report.details) group.details.push(report.details);
      if (report.createdAt > group.latestAt) group.latestAt = report.createdAt;
    }
    return [...byReview.values()].sort((a, b) => b.reportCount - a.reportCount || b.latestAt - a.latestAt);
  }
}

class ModerateReview {
  constructor(reviewRepository, reportRepository) {
    this.reviewRepository = reviewRepository;
    this.reportRepository = reportRepository;
  }

  async execute(moderator, reviewId, input) {
    const review = await loadReview(this.reviewRepository, reviewId);
    const { action } = parse(moderationSchema, input);
    if (action === 'remove') {
      await this.reviewRepository.delete(review.id);
    } else {
      await this.reportRepository.dismissOpenForReview(review.id, moderator.id);
    }
  }
}

module.exports = { ReportReview, ListReportedReviews, ModerateReview, AlreadyReportedError, REASONS };
