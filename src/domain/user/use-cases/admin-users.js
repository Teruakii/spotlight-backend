const { z } = require('zod');
const AppError = require('../../shared/errors/app-errors');
const { UserNotFoundError, InvalidUserDataError } = require('../errors/errors');
const User = require('../entities/user');

const filtersSchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  status: z.enum(['all', 'active', 'suspended']).optional().default('all'),
});
const idSchema = z.coerce.number().int().positive();
const suspensionSchema = z.object({ suspended: z.boolean() }).strict();

class CannotSuspendUserError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new InvalidUserDataError(
      result.error.errors.map((err) => ({ field: err.path.join('.'), message: err.message })),
    );
  }
  return result.data;
}

function toAdminUser(record) {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    role: record.role,
    isSuspended: record.isSuspended,
    createdAt: record.createdAt,
    lastLoginAt: record.lastLoginAt ?? null,
    counts: record.counts ?? { places: 0, reviews: 0 },
  };
}

class ListUsers {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(rawFilters = {}) {
    const { search, status } = parse(filtersSchema, rawFilters);
    const suspended = status === 'all' ? undefined : status === 'suspended';
    const records = await this.userRepository.findAllForAdmin({ search, suspended });
    return records.map(toAdminUser);
  }
}

class SetUserSuspension {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(admin, rawId, input) {
    const id = parse(idSchema, rawId);
    const { suspended } = parse(suspensionSchema, input);
    if (id === admin.id) throw new CannotSuspendUserError('You cannot suspend your own account');

    const record = await this.userRepository.findById(id);
    if (!record) throw new UserNotFoundError();
    if (new User(record).isAdmin()) throw new CannotSuspendUserError('Admin accounts cannot be suspended here');

    await this.userRepository.update({ id, isSuspended: suspended });
    const [updated] = await this.userRepository.findAllForAdmin({ ids: [id] });
    return toAdminUser(updated);
  }
}

module.exports = { ListUsers, SetUserSuspension, CannotSuspendUserError };
