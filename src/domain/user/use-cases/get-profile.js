class GetProfile {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(user) {
    const stats = await this.userRepository.countActivity(user.id);
    return { user, stats };
  }
}

module.exports = GetProfile;
