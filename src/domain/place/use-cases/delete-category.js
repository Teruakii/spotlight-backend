const { z } = require("zod");
const {
  CategoryNotFoundError,
  InvalidCategoryDataError,
  CategoryInUseError,
  ForbiddenPlaceActionError,
} = require("../errors/errors");

const idSchema = z.coerce.number().int().positive();

class DeleteCategory {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(requester, id) {
    if (!requester || !requester.hasPermission("category:manage")) {
      throw new ForbiddenPlaceActionError();
    }

    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      throw new InvalidCategoryDataError("Invalid category id");
    }

    const existing = await this.categoryRepository.findById(parsedId.data);
    if (!existing) {
      throw new CategoryNotFoundError();
    }
    const placesCount = await this.categoryRepository.countPlacesUsingCategory(
      parsedId.data,
    );
    if (placesCount > 0) {
      throw new CategoryInUseError(placesCount);
    }

    await this.categoryRepository.delete(parsedId.data);
  }
}

module.exports = DeleteCategory;
