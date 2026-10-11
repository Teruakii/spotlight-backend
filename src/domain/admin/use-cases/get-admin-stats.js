const { z } = require('zod');
const AppError = require('../../shared/errors/app-errors');
const { PERIODS, resolvePeriod, toSeries } = require('../period');

const periodSchema = z.enum(Object.keys(PERIODS)).default('30D');

class GetAdminStats {
  constructor(statsRepository, now = () => new Date()) {
    this.statsRepository = statsRepository;
    this.now = now;
  }

  async execute(rawPeriod) {
    const parsed = periodSchema.safeParse(rawPeriod);
    if (!parsed.success) {
      throw new AppError(`period must be one of ${Object.keys(PERIODS).join(', ')}`, 400);
    }
    const period = parsed.data;
    const { unit, since, buckets } = resolvePeriod(period, this.now());

    const [totals, deltas, views, reviews, categoryMix, recentActivity] = await Promise.all([
      this.statsRepository.countTotals(),
      this.statsRepository.countSince(since),
      this.statsRepository.countViewsByBucket(since, unit),
      this.statsRepository.countReviewsByBucket(since, unit),
      this.statsRepository.categoryMix(),
      this.statsRepository.recentActivity(8),
    ]);

    return {
      period,
      totals,
      deltas,
      series: {
        labels: buckets.map((b) => b.label),
        visits: toSeries(buckets, views),
        reviews: toSeries(buckets, reviews),
      },
      categoryMix,
      recentActivity,
    };
  }
}

module.exports = GetAdminStats;
