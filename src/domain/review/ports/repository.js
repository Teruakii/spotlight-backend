class ReviewRepository {
  async findById(id) {
    throw new Error('ReviewRepository.findById() must be implemented');
  }

  async findByPlaceId(placeId) {
    throw new Error('ReviewRepository.findByPlaceId() must be implemented');
  }

  async findByUserId(userId) {
    throw new Error('ReviewRepository.findByUserId() must be implemented');
  }

  async findDetailedByPlaceId(placeId, viewerId) {
    throw new Error('ReviewRepository.findDetailedByPlaceId() must be implemented');
  }

  async createDetailed(data, imageUrls) {
    throw new Error('ReviewRepository.createDetailed() must be implemented');
  }

  async addHelpfulVote(reviewId, userId) {
    throw new Error('ReviewRepository.addHelpfulVote() must be implemented');
  }

  async removeHelpfulVote(reviewId, userId) {
    throw new Error('ReviewRepository.removeHelpfulVote() must be implemented');
  }

  async create(data) {
    throw new Error('ReviewRepository.create() must be implemented');
  }

  async update(id, data) {
    throw new Error('ReviewRepository.update() must be implemented');
  }

  async delete(id) {
    throw new Error('ReviewRepository.delete() must be implemented');
  }
}

module.exports = ReviewRepository;
