const { z } = require("zod");
const Place = require("../entities/place");

const limitSchema = z.coerce.number().int().min(1).max(20).catch(4);

const byQuality = (a, b) =>
  (b.rating ?? -1) - (a.rating ?? -1) || b.reviewCount - a.reviewCount;

// "Picked for you": approved places the user hasn't saved or created, from the
// categories they save most, then topped up with the best-rated places overall.
class RecommendPlaces {
  constructor(placeRepository, savedPlaceRepository) {
    this.placeRepository = placeRepository;
    this.savedPlaceRepository = savedPlaceRepository;
  }

  async execute(user, rawLimit) {
    const limit = limitSchema.parse(rawLimit);
    const saved = await this.savedPlaceRepository.findPlacesByUserId(user.id);
    const savedIds = new Set(saved.map((p) => p.id));

    const categoryWeight = new Map();
    for (const place of saved) {
      categoryWeight.set(place.categoryId, (categoryWeight.get(place.categoryId) || 0) + 1);
    }

    const candidates = (await this.placeRepository.findAll({ status: Place.STATUS.APPROVED }))
      .map((record) => new Place(record))
      .filter((place) => !savedIds.has(place.id) && !place.isOwnedBy(user.id));

    const fromSavedCategories = candidates
      .filter((place) => categoryWeight.has(place.categoryId))
      .sort((a, b) => categoryWeight.get(b.categoryId) - categoryWeight.get(a.categoryId) || byQuality(a, b))
      .map((place) => Object.assign(place, { reason: "saved-category" }));

    const picked = new Set(fromSavedCategories.map((p) => p.id));
    const topRated = candidates
      .filter((place) => !picked.has(place.id))
      .sort(byQuality)
      .map((place) => Object.assign(place, { reason: "top-rated" }));

    return [...fromSavedCategories, ...topRated].slice(0, limit);
  }
}

module.exports = RecommendPlaces;
