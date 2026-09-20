const { z } = require('zod');
const { UserNotFoundError, InvalidUserDataError } = require('../errors/errors');
const User = require('../entities/user');

const idSchema = z.coerce.number().int().positive();

class GetUserById {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id) {

    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      throw new InvalidUserDataError('Invalid user id');
    }

    const record = await this.userRepository.findById(parsedId.data);
    if (!record) {
      throw new UserNotFoundError();
    }

    return new User(record);
  }
}

module.exports = GetUserById;