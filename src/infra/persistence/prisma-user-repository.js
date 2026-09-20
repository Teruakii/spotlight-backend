const UserRepository = require('../../domain/user/ports/repository');

// include role พร้อม permission ของ role นั้นทุกครั้งที่ query user —
// เพราะ authenticate middleware โหลด user ใหม่ทุก request อยู่แล้ว (ดู authenticate.js)
// จึงมั่นใจได้ว่า permission ที่เช็คสดใหม่เสมอ ไม่ค้างจาก JWT เก่า
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

  // แปลง shape ที่ Prisma include มาให้ (role เป็น object ซ้อน permissions เป็น
  // array ของ join row { permission: {...} }) ให้เป็น flat DTO ธรรมดาที่
  // domain layer (User entity) ไม่ต้องรู้จัก Prisma เลย — นี่คือหน้าที่ของ adapter
  // ตามหลัก Hexagonal: แปลงรูปแบบข้อมูลจากโลกภายนอกให้ตรงกับ contract ที่ domain คาดหวัง
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
