const { z } = require("zod");
const { InvalidPlaceDataError } = require("../errors/errors");
const Place = require("../entities/place");

const filtersSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  mine: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

class ListPlaces {
  constructor(placeRepository) {
    this.placeRepository = placeRepository;
  }

  async execute(rawFilters = {}, requester = null) {
    const validationResult = filtersSchema.safeParse(rawFilters);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new InvalidPlaceDataError(details);
    }

    const { categoryId, status, mine } = validationResult.data;
    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (mine) {
      if (!requester) {
        where.status = Place.STATUS.APPROVED;
      } else {
        where.createdBy = requester.id;
        if (status) where.status = status;
      }
    } else if (
      requester &&
      (requester.hasPermission("place:manage_any") || requester.hasPermission("place:moderate"))
    ) {
      if (status) where.status = status;
    } else {
      where.status = Place.STATUS.APPROVED;
    }

    const records = await this.placeRepository.findAll(where);
    return records.map((record) => new Place(record));
  }
}

module.exports = ListPlaces;
