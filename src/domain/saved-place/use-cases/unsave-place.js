const { z } = require('zod');
const { InvalidPlaceDataError } = require('../../place/errors/errors');

const placeIdSchema = z.coerce.number().int().positive();

class UnsavePlace {
  constructor(savedPlaceRepository) {
    this.savedPlaceRepository = savedPlaceRepository;
  }

  // Idempotent: removing a place that is not saved succeeds.
  async execute(user, placeId) {
    const parsedPlaceId = placeIdSchema.safeParse(placeId);
    if (!parsedPlaceId.success) {
      throw new InvalidPlaceDataError('Invalid place id');
    }
    await this.savedPlaceRepository.remove(user.id, parsedPlaceId.data);
  }
}

module.exports = UnsavePlace;
