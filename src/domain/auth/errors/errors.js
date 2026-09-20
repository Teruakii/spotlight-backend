const AppError = require("../../shared/errors/app-errors");

class InvalidCredentialsError extends AppError {
  constructor() {
    super("Invalid email or password", 401);
  }
}

class AccountSuspendedError extends AppError {
  constructor() {
    super("This account has been suspended", 403);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

module.exports = {
  InvalidCredentialsError,
  AccountSuspendedError,
  UnauthorizedError,
};
