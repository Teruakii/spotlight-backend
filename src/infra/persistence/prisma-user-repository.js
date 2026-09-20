const UserRepository = require('../../domain/user/ports/repository');

const USER_INCLUDE = {
  role: {
    include: {
      permissions: { include: { permission: true } },
    },
  },
};

class PrismaUserRepository extends UserRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findById(id) {
    const record = await this.prisma.user.findUnique({
      where: { id },
      include: USER_INCLUDE,
    });
    return this._flatten(record);
  }

  async findByEmail(email) {
    const record = await this.prisma.user.findUnique({
      where: { email },
      include: USER_INCLUDE,
    });
    return this._flatten(record);
  }

  async create(userData) {
    const record = await this.prisma.user.create({
      data: userData,
      include: USER_INCLUDE,
    });
    return this._flatten(record);
  }

  async update(userData) {
    const { id, ...data } = userData;
    const record = await this.prisma.user.update({
      where: { id },
      data,
      include: USER_INCLUDE,
    });
    return this._flatten(record);
  }

  async recordLogin(id) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  isDuplicateEmailError(err) {
    return err.code === 'P2002' && JSON.stringify(err.meta ?? {}).includes('email');
  }
  _flatten(record) {
    if (!record) return null;
    const { role, ...rest } = record;
    return {
      ...rest,
      role: role ? role.name : null,
      permissions: role && role.permissions
        ? role.permissions.map((rp) => rp.permission.name)
        : [],
    };
  }
}

module.exports = PrismaUserRepository;
