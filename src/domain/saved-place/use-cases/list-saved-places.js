const Place = require('../../place/entities/place');

class ListSavedPlaces {
  constructor(savedPlaceRepository) {
    this.savedPlaceRepository = savedPlaceRepository;
  }

  // A saved place that later leaves "approved" stays saved but is hidden,
  // unless the user created it.
  async execute(user) {
    const records = await this.savedPlaceRepository.findPlacesByUserId(user.id);
    return records
      .map((record) => new Place(record))
      .filter((place) => place.isApproved() || place.isOwnedBy(user.id));
  }
}

module.exports = ListSavedPlaces;
