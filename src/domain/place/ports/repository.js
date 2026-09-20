class PlaceRepository {
  async findById(id) {
    throw new Error('PlaceRepository.findById() must be implemented');
  }

  async findAll(filters) {
    throw new Error('PlaceRepository.findAll() must be implemented');
  }

  async create(data) {
    throw new Error('PlaceRepository.create() must be implemented');
  }

  async update(id, data) {
    throw new Error('PlaceRepository.update() must be implemented');
  }

  async delete(id) {
    throw new Error('PlaceRepository.delete() must be implemented');
  }
}

module.exports = PlaceRepository;
