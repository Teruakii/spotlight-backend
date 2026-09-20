class PasswordHasher {
  async hash(plainPassword) {
    throw new Error('PasswordHasher.hash() must be implemented');
  }

  async compare(plainPassword, hash) {
    throw new Error('PasswordHasher.compare() must be implemented');
  }
}

module.exports = PasswordHasher;
