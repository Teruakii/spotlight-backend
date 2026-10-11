const { z } = require('zod');
const { InvalidUserDataError } = require('../errors/errors');
const User = require('../entities/user');

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((v) => (v === '' ? null : v));

const optionalUrl = z
  .union([z.literal(''), z.string().trim().url('Must be a valid URL').max(500)])
  .nullable()
  .transform((v) => (v === '' ? null : v));

const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    bio: optionalText(500),
    location: optionalText(100),
    avatarUrl: optionalUrl,
    coverUrl: optionalUrl,
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

class UpdateProfile {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(user, input) {
    const validationResult = updateProfileSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new InvalidUserDataError(details);
    }

    const record = await this.userRepository.update({ id: user.id, ...validationResult.data });
    return new User(record);
  }
}

module.exports = UpdateProfile;
