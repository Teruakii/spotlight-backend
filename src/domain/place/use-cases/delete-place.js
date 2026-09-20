const { z } = require("zod");
const {
  PlaceNotFoundError,
  ForbiddenPlaceActionError,
  InvalidPlaceDataError,
} = require("../errors/errors");
const Place = require("../entities/place");

const idSchema = z.coerce.number().int().positive();

class DeletePlace {
  constructor(placeRepository) {
    this.placeRepository = placeRepository;
  }

  async execute(requester, id) {
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      throw new InvalidPlaceDataError("Invalid place id");
    }

    const record = await this.placeRepository.findById(parsedId.data);
    if (!record) {
      throw new PlaceNotFoundError();
    }

    const place = new Place(record);
    if (
      !requester ||
      (!requester.hasPermission("place:manage_any") && !place.isOwnedBy(requester.id))
    ) {
      throw new ForbiddenPlaceActionError();
    }

    await this.placeRepository.delete(parsedId.data);
    return true;
  }
}

module.exports = DeletePlace;
