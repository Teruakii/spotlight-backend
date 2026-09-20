const AppError = require('../../shared/errors/app-errors');

class PlaceNotFoundError extends AppError {
  constructor() {
    super('Place not found', 404);
  }
}

class ForbiddenPlaceActionError extends AppError {
  constructor() {
    super('You do not have permission to perform this action on this place', 403);
  }
}

class InvalidPlaceDataError extends AppError {
  constructor(details) {
    const message = Array.isArray(details)
      ? details.map((d) => d.message).join(', ')
      : details;
    super(message, 400);
    this.details = details;
  }
}

class CategoryNotFoundError extends AppError {
  constructor() {
    super('Category not found', 404);
  }
}

class InvalidCategoryDataError extends AppError {
  constructor(details) {
    const message = Array.isArray(details)
      ? details.map((d) => d.message).join(', ')
      : details;
    super(message, 400);
    this.details = details;
  }
}

class CategoryAlreadyExistsError extends AppError {
  constructor() {
    super('Category with this name already exists', 409);
  }
}

class CategoryInUseError extends AppError {
  constructor(placesCount) {
    super(
      `Cannot delete category: ${placesCount} place(s) still use it. Reassign or remove them first.`,
      409,
    );
    this.placesCount = placesCount;
  }
}

class PlaceImageNotFoundError extends AppError {
  constructor() {
    super('Place image not found', 404);
  }
}

class InvalidPlaceImageDataError extends AppError {
  constructor(details) {
    const message = Array.isArray(details)
      ? details.map((d) => d.message).join(', ')
      : details;
    super(message, 400);
    this.details = details;
  }
}

class InvalidPlaceTransportDataError extends AppError {
  constructor(details) {
    const message = Array.isArray(details)
      ? details.map((d) => d.message).join(', ')
      : details;
    super(message, 400);
    this.details = details;
  }
}

module.exports = {
  PlaceNotFoundError,
  ForbiddenPlaceActionError,
  InvalidPlaceDataError,
  CategoryNotFoundError,
  InvalidCategoryDataError,
  CategoryAlreadyExistsError,
  CategoryInUseError,
  PlaceImageNotFoundError,
  InvalidPlaceImageDataError,
  InvalidPlaceTransportDataError,
};
