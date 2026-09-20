class CategoryRepository {
  async findById(id) {
    throw new Error("CategoryRepository.findById() must be implemented");
  }

  async findAll() {
    throw new Error("CategoryRepository.findAll() must be implemented");
  }

  async findByName(name) {
    throw new Error("CategoryRepository.findByName() must be implemented");
  }

  async create(data) {
    throw new Error("CategoryRepository.create() must be implemented");
  }

  async update(id, data) {
    throw new Error("CategoryRepository.update() must be implemented");
  }

  async delete(id) {
    throw new Error("CategoryRepository.delete() must be implemented");
  }

  async countPlacesUsingCategory(id) {
    throw new Error("CategoryRepository.countPlacesUsingCategory() must be implemented");
  }
}

module.exports = CategoryRepository;
