const AppError = require('../../shared/errors/app-errors');

class UserNotFoundError extends AppError {
  constructor() {
    super('User not found', 404);
  }
}

class EmailAlreadyInUseError extends AppError {
  constructor() {
    super('Email is already in use', 409);
  }
}

class InvalidUserDataError extends AppError {
  constructor(details) {
    const message = Array.isArray(details)
      ? details.map((d) => d.message).join(', ')
      : details;
    super(message, 400);
    this.details = details;
  }
}

module.exports = {
  UserNotFoundError,
  EmailAlreadyInUseError,
  InvalidUserDataError,
};