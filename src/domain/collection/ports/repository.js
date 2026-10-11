class CollectionRepository {
  async findAllByUserId(userId) {
    throw new Error('CollectionRepository.findAllByUserId() must be implemented');
  }

  async findById(id) {
    throw new Error('CollectionRepository.findById() must be implemented');
  }

  async create(data) {
    throw new Error('CollectionRepository.create() must be implemented');
  }

  async update(id, data) {
    throw new Error('CollectionRepository.update() must be implemented');
  }

  async delete(id) {
    throw new Error('CollectionRepository.delete() must be implemented');
  }

  // Appends the place at the end of `day`.
  async addItem(collectionId, { placeId, day, startTime }) {
    throw new Error('CollectionRepository.addItem() must be implemented');
  }

  async removeItem(itemId) {
    throw new Error('CollectionRepository.removeItem() must be implemented');
  }

  // Writes day/position/startTime for every row atomically.
  async replaceLayout(collectionId, rows) {
    throw new Error('CollectionRepository.replaceLayout() must be implemented');
  }
}

module.exports = CollectionRepository;
