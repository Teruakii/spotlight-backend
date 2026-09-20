const { z } = require("zod");
const { InvalidPlaceDataError } = require("../errors/errors");
const Place = require("../entities/place");

const createPlaceInputSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  openingHours: z.string().trim().optional().nullable(),
  priceInfo: z.string().trim().optional().nullable(),
  priceLevel: z.coerce.number().int().min(1).max(4).optional().nullable(),
  bestTime: z.string().trim().optional().nullable(),
  duration: z.string().trim().optional().nullable(),
});

class CreatePlace {
  constructor(placeRepository, categoryRepository) {
    this.placeRepository = placeRepository;
    this.categoryRepository = categoryRepository;
  }

  async execute(creator, input) {
    const validationResult = createPlaceInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new InvalidPlaceDataError(details);
    }

    const category = await this.categoryRepository.findById(
      validationResult.data.categoryId,
    );
    if (!category) {
      throw new InvalidPlaceDataError([
        { field: "categoryId", message: "Category not found" },
      ]);
    }

    const record = await this.placeRepository.create({
      ...validationResult.data,
      createdBy: creator.id,
      status: Place.STATUS.PENDING,
    });

    return new Place(record);
  }
}

module.exports = CreatePlace;