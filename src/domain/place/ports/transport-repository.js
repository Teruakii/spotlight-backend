class PlaceTransportRepository {
  async create(placeId, data) {
    throw new Error("PlaceTransportRepository.create() must be implemented");
  }
}

module.exports = PlaceTransportRepository;
