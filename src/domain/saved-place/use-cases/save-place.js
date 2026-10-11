class SavePlace {
  constructor(savedPlaceRepository, getPlaceById) {
    this.savedPlaceRepository = savedPlaceRepository;
    this.getPlaceById = getPlaceById;
  }

  // Idempotent: saving an already-saved place succeeds without a duplicate row.
  async execute(user, placeId) {
    const place = await this.getPlaceById.execute(placeId, user);
    await this.savedPlaceRepository.save(user.id, place.id);
  }
}

module.exports = SavePlace;
