const AppError = require('../../shared/errors/app-errors');

class CollectionNotFoundError extends AppError {
  constructor() {
    super('Collection not found', 404);
  }
}

class CollectionItemNotFoundError extends AppError {
  constructor() {
    super('Collection item not found', 404);
  }
}

class PlaceAlreadyInCollectionError extends AppError {
  constructor() {
    super('This place is already in the collection', 409);
  }
}

class InvalidCollectionDataError extends AppError {
  constructor(details) {
    const message = Array.isArray(details)
      ? details.map((d) => d.message).join(', ')
      : details;
    super(message, 400);
    this.details = details;
  }
}

module.exports = {
  CollectionNotFoundError,
  CollectionItemNotFoundError,
  PlaceAlreadyInCollectionError,
  InvalidCollectionDataError,
};
