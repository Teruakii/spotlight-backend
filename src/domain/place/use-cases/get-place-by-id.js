const { z } = require("zod");
const {
  PlaceNotFoundError,
  InvalidPlaceDataError,
} = require("../errors/errors");
const Place = require("../entities/place");

const idSchema = z.coerce.number().int().positive();

class GetPlaceById {
  constructor(placeRepository) {
    this.placeRepository = placeRepository;
  }

  async execute(id, requester = null) {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      throw new InvalidPlaceDataError("Invalid place id");
    }

    const record = await this.placeRepository.findById(parsedId.data);
    if (!record) {
      throw new PlaceNotFoundError();
    }

    const place = new Place(record);

    const canSeeUnapproved =
      requester &&
      (requester.hasPermission("place:manage_any") ||
        requester.hasPermission("place:moderate") ||
        place.isOwnedBy(requester.id));

    if (!place.isApproved() && !canSeeUnapproved) {
      throw new PlaceNotFoundError();
    }

    return place;
  }
}

module.exports = GetPlaceById;
