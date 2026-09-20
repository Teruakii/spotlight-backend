const { z } = require("zod");
const {
  CategoryNotFoundError,
  InvalidCategoryDataError,
  CategoryAlreadyExistsError,
  ForbiddenPlaceActionError,
} = require("../errors/errors");

const idSchema = z.coerce.number().int().positive();

const updateCategoryInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

class UpdateCategory {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(requester, id, input) {
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

    const validationResult = updateCategoryInputSchema.safeParse(input);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new InvalidCategoryDataError(details);
    }

    if (validationResult.data.name !== undefined) {
      const nameOwner = await this.categoryRepository.findByName(
        validationResult.data.name,
      );
      if (nameOwner && nameOwner.id !== parsedId.data) {
        throw new CategoryAlreadyExistsError();
      }
    }

    return this.categoryRepository.update(parsedId.data, validationResult.data);
  }
}

module.exports = UpdateCategory;
