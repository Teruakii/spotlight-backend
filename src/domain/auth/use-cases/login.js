const { z } = require("zod");
const {
  InvalidCredentialsError,
  AccountSuspendedError,
} = require("../errors/errors");
const User = require("../../user/entities/user");

const loginInputSchema = z.object({
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const DUMMY_PASSWORD_HASH =
  "$2b$12$CwTycUXWue0Thq9StjUM0uJ8p5NPnmT1F/H0AVw6zpqfaB2QLNfoi";

class Login {
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute(input) {
    const validationResult = loginInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidCredentialsError();
    }

    const { email, password } = validationResult.data;

    const record = await this.userRepository.findByEmail(email);

    const passwordHash = record ? record.passwordHash : DUMMY_PASSWORD_HASH;
    const isPasswordValid = await this.passwordHasher.compare(
      password,
      passwordHash,
    );

    if (!record || !isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const user = new User(record);

    if (!user.canLogin()) {
      throw new AccountSuspendedError();
    }

    await this.userRepository.recordLogin(user.id);
    const token = this.tokenService.generate({ sub: user.id, role: user.role });

    return { user, token };
  }
}

module.exports = Login;
