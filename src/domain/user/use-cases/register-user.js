const { z } = require('zod');
const { EmailAlreadyInUseError, InvalidUserDataError } = require('../errors/errors');
const User = require('../entities/user');

const DEFAULT_ROLE_NAME = 'user';

const registerInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email format').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

class RegisterUser {
  constructor(userRepository, passwordHasher, roleRepository) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.roleRepository = roleRepository;
  }

  async execute(input) {

    const validationResult = registerInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new InvalidUserDataError(details);
    }

    const { firstName, lastName, email, password } = validationResult.data;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyInUseError();
    }

    const passwordHash = await this.passwordHasher.hash(password);

    // ห้าม hardcode roleId เป็นเลขตรงๆ (เช่น roleId: 2) เพราะลำดับ id ของ role
    // ขึ้นอยู่กับลำดับที่ seed ไว้ตอน migrate ซึ่งอาจไม่เหมือนกันทุก environment
    // ต้อง lookup จากชื่อเสมอ ถ้าไม่เจอแปลว่า seed migration ยังไม่ได้รัน
    const defaultRole = await this.roleRepository.findByName(DEFAULT_ROLE_NAME);
    if (!defaultRole) {
      throw new Error(
        `Default role "${DEFAULT_ROLE_NAME}" not found. Did the RBAC seed migration run?`,
      );
    }

    try {
      const record = await this.userRepository.create({
        firstName,
        lastName,
        email,
        passwordHash,
        roleId: defaultRole.id,
      });

      return new User(record);
    } catch (err) {
      if (this.userRepository.isDuplicateEmailError(err)) {
        throw new EmailAlreadyInUseError();
      }
      throw err;
    }
  }
}

module.exports = RegisterUser;
