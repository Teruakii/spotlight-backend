class ReviewRepository {
  async findById(id) {
    throw new Error('ReviewRepository.findById() must be implemented');
  }

  async findByPlaceId(placeId) {
    throw new Error('ReviewRepository.findByPlaceId() must be implemented');
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
