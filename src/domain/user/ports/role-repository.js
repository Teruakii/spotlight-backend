class RoleRepository {
  async findByName(name) {
    throw new Error("RoleRepository.findByName() must be implemented");
  }

  async findById(id) {
    throw new Error("RoleRepository.findById() must be implemented");
  }
}

module.exports = RoleRepository;
