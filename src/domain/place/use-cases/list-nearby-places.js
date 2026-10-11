const { z } = require("zod");
const { InvalidPlaceDataError } = require("../errors/errors");
const Place = require("../entities/place");
const { haversineKm, boundingBox } = require("../geo");

const optionsSchema = z.object({
  radiusKm: z.coerce.number().positive().max(100).default(10),
  categoryId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const pointSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new InvalidPlaceDataError(
      result.error.errors.map((err) => ({ field: err.path.join("."), message: err.message })),
    );
  }
  return result.data;
}

function coordinatesOf(place) {
  if (place.latitude === null || place.latitude === undefined) return null;
  if (place.longitude === null || place.longitude === undefined) return null;
  return { lat: Number(place.latitude), lng: Number(place.longitude) };
}

// Approved places near a point, nearest first, each with `distanceKm`.
class ListNearbyPlaces {
  constructor(placeRepository, getPlaceById) {
    this.placeRepository = placeRepository;
    this.getPlaceById = getPlaceById;
  }

  // GET /places/nearby?lat&lng
  async aroundPoint(rawPoint, rawOptions = {}) {
    const center = parse(pointSchema, rawPoint);
    return this._search(center, parse(optionsSchema, rawOptions), null);
  }

  // GET /places/:id/nearby. A place without coordinates has no neighbours.
  async aroundPlace(placeId, rawOptions = {}, requester = null) {
    const options = parse(optionsSchema, { radiusKm: 5, limit: 6, ...rawOptions });
    const place = await this.getPlaceById.execute(placeId, requester);
    const center = coordinatesOf(place);
    if (!center) return [];
    return this._search(center, options, place.id);
  }

  async _search(center, { radiusKm, categoryId, limit }, excludeId) {
    const records = await this.placeRepository.findApprovedWithin({
      ...boundingBox(center, radiusKm),
      categoryId,
    });

    return records
      .filter((record) => record.id !== excludeId)
      .map((record) => {
        const place = new Place(record);
        const distanceKm = haversineKm(center, coordinatesOf(place));
        return Object.assign(place, { distanceKm: Math.round(distanceKm * 100) / 100 });
      })
      .filter((place) => place.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }
}

module.exports = ListNearbyPlaces;
