const { z } = require("zod");
const {
  PlaceNotFoundError,
  ForbiddenPlaceActionError,
  PlaceImageNotFoundError,
  InvalidPlaceImageDataError,
} = require("../errors/errors");
const Place = require("../entities/place");

const idSchema = z.coerce.number().int().positive();

class DeletePlaceImage {
  constructor(placeRepository, imageRepository) {
    this.placeRepository = placeRepository;
    this.imageRepository = imageRepository;
  }

  async execute(requester, placeId, imageId) {
    const parsedPlaceId = idSchema.safeParse(placeId);
    const parsedImageId = idSchema.safeParse(imageId);
    if (!parsedPlaceId.success || !parsedImageId.success) {
      throw new InvalidPlaceImageDataError("Invalid place id or image id");
    }

    const record = await this.placeRepository.findById(parsedPlaceId.data);
    if (!record) {
      throw new PlaceNotFoundError();
    }

    const place = new Place(record);
    if (!requester || (!requester.hasPermission("place:manage_any") && !place.isOwnedBy(requester.id))) {
      throw new ForbiddenPlaceActionError();
    }

    const image = await this.imageRepository.findById(parsedImageId.data);
    if (!image || image.placeId !== parsedPlaceId.data) {
      throw new PlaceImageNotFoundError();
    }

    await this.imageRepository.delete(parsedImageId.data);
  }
}

module.exports = DeletePlaceImage;
