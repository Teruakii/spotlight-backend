class SavedPlaceRepository {
  async save(userId, placeId) {
    throw new Error('SavedPlaceRepository.save() must be implemented');
  }

  async remove(userId, placeId) {
    throw new Error('SavedPlaceRepository.remove() must be implemented');
  }

  async findPlacesByUserId(userId) {
    throw new Error('SavedPlaceRepository.findPlacesByUserId() must be implemented');
  }
}

module.exports = SavedPlaceRepository;
