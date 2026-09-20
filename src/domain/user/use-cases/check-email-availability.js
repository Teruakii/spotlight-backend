const { z } = require('zod');
const { InvalidUserDataError } = require('../errors/errors');

const emailSchema = z.string().trim().email('Invalid email format').toLowerCase();

class CheckEmailAvailability {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email) {
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      throw new InvalidUserDataError(validationResult.error.errors[0].message);
    }

    const existingUser = await this.userRepository.findByEmail(validationResult.data);

    return { email: validationResult.data, available: !existingUser };
  }
}

module.exports = CheckEmailAvailability;
