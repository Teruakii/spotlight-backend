class PlaceImageRepository {
  async findById(id) {
    throw new Error("PlaceImageRepository.findById() must be implemented");
  }

  async create(placeId, data) {
    throw new Error("PlaceImageRepository.create() must be implemented");
  }

  async delete(id) {
    throw new Error("PlaceImageRepository.delete() must be implemented");
  }
}

module.exports = PlaceImageRepository;
