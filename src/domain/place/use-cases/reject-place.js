const { z } = require("zod");
const {
  PlaceNotFoundError,
  ForbiddenPlaceActionError,
  InvalidPlaceDataError,
} = require("../errors/errors");
const Place = require("../entities/place");

const idSchema = z.coerce.number().int().positive();

class RejectPlace {
  constructor(placeRepository) {
    this.placeRepository = placeRepository;
  }

  async execute(admin, id) {
    if (!admin || !admin.hasPermission("place:moderate")) {
      throw new ForbiddenPlaceActionError();
    }

    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      throw new InvalidPlaceDataError("Invalid place id");
    }

    const record = await this.placeRepository.findById(parsedId.data);
    if (!record) {
      throw new PlaceNotFoundError();
    }

    const updated = await this.placeRepository.update(parsedId.data, {
      status: Place.STATUS.REJECTED,
    });
    return new Place(updated);
  }
}

module.exports = RejectPlace;
