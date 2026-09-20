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

    // เช็คก่อนลบว่ามี place ใช้ category นี้อยู่ไหม — ถ้าไม่เช็คตรงนี้ Prisma จะ throw
    // raw foreign key constraint error (P2003) ที่ error-handler มองว่า "unexpected error" (500)
    // เพราะ err.isOperational ไม่ true จึงต้องดักเป็น business error ที่นี่ก่อน
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
