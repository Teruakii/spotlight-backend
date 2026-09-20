const { z } = require("zod");
const {
  PlaceNotFoundError,
  ForbiddenPlaceActionError,
  InvalidPlaceDataError,
} = require("../errors/errors");
const Place = require("../entities/place");

const idSchema = z.coerce.number().int().positive();

const updatePlaceInputSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().nullable(),
    address: z.string().trim().nullable(),
    latitude: z.coerce.number().min(-90).max(90).nullable(),
    longitude: z.coerce.number().min(-180).max(180).nullable(),
    openingHours: z.string().trim().nullable(),
    priceInfo: z.string().trim().nullable(),
    priceLevel: z.coerce.number().int().min(1).max(4).nullable(),
    bestTime: z.string().trim().nullable(),
    duration: z.string().trim().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

class UpdatePlace {
  constructor(placeRepository, categoryRepository) {
    this.placeRepository = placeRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute(requester, id, input) {
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

    const validationResult = updatePlaceInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new InvalidPlaceDataError(details);
    }

    if (validationResult.data.categoryId !== undefined) {
      const category = await this.categoryRepository.findById(
        validationResult.data.categoryId,
      );
      if (!category) {
        throw new InvalidPlaceDataError([
          { field: "categoryId", message: "Category not found" },
        ]);
      }
    }

    const updateData = { ...validationResult.data };

    if (!requester.hasPermission("place:manage_any") && place.isApproved()) {
      updateData.status = Place.STATUS.PENDING;
    }

    const updated = await this.placeRepository.update(
      parsedId.data,
      updateData,
    );
    return new Place(updated);
  }
}

module.exports = UpdatePlace;
