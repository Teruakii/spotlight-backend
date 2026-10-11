class StatsRepository {
  // { places (approved), reviews, users, pending }
  async countTotals() {
    throw new Error('StatsRepository.countTotals() must be implemented');
  }

  // { places, reviews, users, activeUsers } created / logged in since `since`
  async countSince(since) {
    throw new Error('StatsRepository.countSince() must be implemented');
  }

  // Map of bucket key ('YYYY-MM-DD' or 'YYYY-MM') -> count, for unit 'day' | 'month'
  async countViewsByBucket(since, unit) {
    throw new Error('StatsRepository.countViewsByBucket() must be implemented');
  }

  async countReviewsByBucket(since, unit) {
    throw new Error('StatsRepository.countReviewsByBucket() must be implemented');
  }

  // [{ id, name, count }] of approved places per category
  async categoryMix() {
    throw new Error('StatsRepository.categoryMix() must be implemented');
  }

  // Newest first: [{ type, title, detail, placeId, at }]
  async recentActivity(limit) {
    throw new Error('StatsRepository.recentActivity() must be implemented');
  }

  async recordView(placeId, userId) {
    throw new Error('StatsRepository.recordView() must be implemented');
  }
}

module.exports = StatsRepository;
