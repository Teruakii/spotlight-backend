const { z } = require('zod');
const {
  InvalidUserDataError,
  IncorrectPasswordError,
  AccountHasPlacesError,
} = require('../errors/errors');

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

class DeleteAccount {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  // Reviews and saved places cascade with the user. Places do not (FK is
  // Restrict), so an account that still owns places cannot be deleted.
  async execute(user, input) {
    const validationResult = deleteAccountSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidUserDataError('Password is required');
    }

    const record = await this.userRepository.findById(user.id);
    const matches = await this.passwordHasher.compare(
      validationResult.data.password,
      record.passwordHash,
    );
    if (!matches) {
      throw new IncorrectPasswordError();
    }

    const { places } = await this.userRepository.countActivity(user.id);
    if (places > 0) {
      throw new AccountHasPlacesError(places);
    }

    await this.userRepository.delete(user.id);
  }
}

module.exports = DeleteAccount;
