const { z } = require("zod");
const {
  PlaceNotFoundError,
  ForbiddenPlaceActionError,
  InvalidPlaceImageDataError,
} = require("../errors/errors");
const Place = require("../entities/place");

const placeIdSchema = z.coerce.number().int().positive();

const addPlaceImageInputSchema = z.object({
  imageUrl: z.string().trim().url("imageUrl must be a valid URL"),
});

class AddPlaceImage {
  constructor(placeRepository, imageRepository) {
    this.placeRepository = placeRepository;
    this.imageRepository = imageRepository;
  }

  async execute(requester, placeId, input) {
    const parsedPlaceId = placeIdSchema.safeParse(placeId);
    if (!parsedPlaceId.success) {
      throw new InvalidPlaceImageDataError("Invalid place id");
    }

    const record = await this.placeRepository.findById(parsedPlaceId.data);
    if (!record) {
      throw new PlaceNotFoundError();
    }

    const place = new Place(record);
    if (!requester || (!requester.hasPermission("place:manage_any") && !place.isOwnedBy(requester.id))) {
      throw new ForbiddenPlaceActionError();
    }

    const validationResult = addPlaceImageInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new InvalidPlaceImageDataError(details);
    }

    return this.imageRepository.create(parsedPlaceId.data, validationResult.data);
  }
}

module.exports = AddPlaceImage;
