class UserRepository {
  async findById(id) {
    throw new Error('UserRepository.findById() must be implemented');
  }

  async findByEmail(email) {
    throw new Error('UserRepository.findByEmail() must be implemented');
  }

  async create(userData) {
    throw new Error('UserRepository.create() must be implemented');
  }

  async update(userData) {
    throw new Error('UserRepository.update() must be implemented');
  }

  async recordLogin(id) {
    throw new Error('UserRepository.recordLogin() must be implemented');
  }


  isDuplicateEmailError(err) {
    throw new Error('UserRepository.isDuplicateEmailError() must be implemented');
  }
}

module.exports = UserRepository;