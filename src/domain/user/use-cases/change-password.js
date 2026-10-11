const { z } = require('zod');
const { InvalidUserDataError, IncorrectPasswordError } = require('../errors/errors');

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

class ChangePassword {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute(user, input) {
    const validationResult = changePasswordSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new InvalidUserDataError(details);
    }

    const { currentPassword, newPassword } = validationResult.data;
    const record = await this.userRepository.findById(user.id);
    const matches = await this.passwordHasher.compare(currentPassword, record.passwordHash);
    if (!matches) {
      throw new IncorrectPasswordError();
    }

    await this.userRepository.update({
      id: user.id,
      passwordHash: await this.passwordHasher.hash(newPassword),
      passwordChangedAt: new Date(),
    });
  }
}

module.exports = ChangePassword;
