const { z } = require("zod");
const {
  PlaceNotFoundError,
  ForbiddenPlaceActionError,
  InvalidPlaceTransportDataError,
} = require("../errors/errors");
const Place = require("../entities/place");

const placeIdSchema = z.coerce.number().int().positive();

const addPlaceTransportInputSchema = z.object({
  method: z.string().trim().min(1, "method is required").max(50),
  detail: z.string().trim().min(1, "detail is required").max(255),
});

class AddPlaceTransport {
  constructor(placeRepository, transportRepository) {
    this.placeRepository = placeRepository;
    this.transportRepository = transportRepository;
  }

  async execute(requester, placeId, input) {
    const parsedPlaceId = placeIdSchema.safeParse(placeId);
    if (!parsedPlaceId.success) {
      throw new InvalidPlaceTransportDataError("Invalid place id");
    }

    const record = await this.placeRepository.findById(parsedPlaceId.data);
    if (!record) {
      throw new PlaceNotFoundError();
    }

    const place = new Place(record);
    if (!requester || (!requester.hasPermission("place:manage_any") && !place.isOwnedBy(requester.id))) {
      throw new ForbiddenPlaceActionError();
    }

    const validationResult = addPlaceTransportInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new InvalidPlaceTransportDataError(details);
    }

    return this.transportRepository.create(parsedPlaceId.data, validationResult.data);
  }
}

module.exports = AddPlaceTransport;
