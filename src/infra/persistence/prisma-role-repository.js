const RoleRepository = require('../../domain/user/ports/role-repository');

class PrismaRoleRepository extends RoleRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findByName(name) {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async findById(id) {
    return this.prisma.role.findUnique({ where: { id } });
  }
}

module.exports = PrismaRoleRepository;
