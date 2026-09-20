const bcrypt = require('bcrypt');
const PasswordHasher = require('../../domain/user/ports/password-hasher');

class BcryptPasswordHasher extends PasswordHasher {
  constructor(saltRounds = 12) {
    super();
    this.saltRounds = saltRounds;
  }

  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }
}

module.exports = BcryptPasswordHasher;