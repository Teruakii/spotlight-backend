const { z } = require("zod");
const {
  InvalidCategoryDataError,
  CategoryAlreadyExistsError,
  ForbiddenPlaceActionError,
} = require("../errors/errors");

const createCategoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

class CreateCategory {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(requester, input) {
    // requirePermission('category:manage') middleware กันไว้ที่ route แล้ว แต่เช็คซ้ำที่ use case
    // เพราะ use case ต้องปลอดภัยได้ด้วยตัวเอง ไม่พึ่งแค่ middleware ชั้นเดียว
    if (!requester || !requester.hasPermission("category:manage")) {
      throw new ForbiddenPlaceActionError();
    }

    const validationResult = createCategoryInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new InvalidCategoryDataError(details);
    }

    const existing = await this.categoryRepository.findByName(
      validationResult.data.name,
    );
    if (existing) {
      throw new CategoryAlreadyExistsError();
    }

    return this.categoryRepository.create(validationResult.data);
  }
}

module.exports = CreateCategory;
