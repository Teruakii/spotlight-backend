const { z } = require('zod');
const {
  CollectionNotFoundError,
  CollectionItemNotFoundError,
  PlaceAlreadyInCollectionError,
  InvalidCollectionDataError,
} = require('../errors/errors');
const { Collection, toCollectionSummary, planLayout } = require('../entities/collection');

const idSchema = z.coerce.number().int().positive();

const fieldsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  isPrivate: z.boolean(),
});
const createSchema = fieldsSchema.partial({ description: true, isPrivate: true }).strict();
const updateSchema = fieldsSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

const startTimeSchema = z
  .string()
  .regex(Collection.START_TIME, 'Start time must be HH:MM (24-hour)')
  .nullable()
  .optional();
const daySchema = z.coerce.number().int().min(1).max(Collection.MAX_DAYS);

const addItemSchema = z
  .object({ placeId: idSchema, day: daySchema.default(1), startTime: startTimeSchema })
  .strict();
const layoutSchema = z
  .object({
    items: z.array(z.object({ id: idSchema, day: daySchema, startTime: startTimeSchema }).strict()),
  })
  .strict();

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new InvalidCollectionDataError(
      result.error.errors.map((err) => ({ field: err.path.join('.'), message: err.message })),
    );
  }
  return result.data;
}

// The owner's collection, or 404 — private collections must not reveal that
// they exist, so "not yours" and "missing" look the same.
async function loadOwned(repository, user, rawId) {
  const id = parse(idSchema, rawId);
  const record = await repository.findById(id);
  if (!record || record.userId !== user.id) throw new CollectionNotFoundError();
  return new Collection(record);
}

class ListMyCollections {
  constructor(collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  async execute(user) {
    const records = await this.collectionRepository.findAllByUserId(user.id);
    return records.map(toCollectionSummary);
  }
}

class CreateCollection {
  constructor(collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  async execute(user, input) {
    const data = parse(createSchema, input);
    const record = await this.collectionRepository.create({ ...data, userId: user.id });
    return new Collection(record);
  }
}

class GetCollection {
  constructor(collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  async execute(rawId, viewer = null) {
    const record = await this.collectionRepository.findById(parse(idSchema, rawId));
    const collection = record ? new Collection(record) : null;
    if (!collection || !collection.canBeViewedBy(viewer)) throw new CollectionNotFoundError();
    return collection.visibleTo(viewer);
  }
}

class UpdateCollection {
  constructor(collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  async execute(user, rawId, input) {
    const collection = await loadOwned(this.collectionRepository, user, rawId);
    const data = parse(updateSchema, input);
    await this.collectionRepository.update(collection.id, data);
    return new Collection(await this.collectionRepository.findById(collection.id));
  }
}

class DeleteCollection {
  constructor(collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  async execute(user, rawId) {
    const collection = await loadOwned(this.collectionRepository, user, rawId);
    await this.collectionRepository.delete(collection.id);
  }
}

class AddCollectionItem {
  constructor(collectionRepository, getPlaceById) {
    this.collectionRepository = collectionRepository;
    this.getPlaceById = getPlaceById;
  }

  async execute(user, rawId, input) {
    const collection = await loadOwned(this.collectionRepository, user, rawId);
    const { placeId, day, startTime } = parse(addItemSchema, input);
    const place = await this.getPlaceById.execute(placeId, user);
    if (collection.items.some((item) => item.place.id === place.id)) {
      throw new PlaceAlreadyInCollectionError();
    }
    await this.collectionRepository.addItem(collection.id, { placeId: place.id, day, startTime: startTime ?? null });
    return new Collection(await this.collectionRepository.findById(collection.id));
  }
}

class RemoveCollectionItem {
  constructor(collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  async execute(user, rawId, rawItemId) {
    const collection = await loadOwned(this.collectionRepository, user, rawId);
    const itemId = parse(idSchema, rawItemId);
    if (!collection.items.some((item) => item.id === itemId)) throw new CollectionItemNotFoundError();
    await this.collectionRepository.removeItem(itemId);
    return new Collection(await this.collectionRepository.findById(collection.id));
  }
}

class SetCollectionLayout {
  constructor(collectionRepository) {
    this.collectionRepository = collectionRepository;
  }

  async execute(user, rawId, input) {
    const collection = await loadOwned(this.collectionRepository, user, rawId);
    const { items } = parse(layoutSchema, input);
    const { rows, error } = planLayout(
      collection.items.map((item) => item.id),
      items,
    );
    if (error) throw new InvalidCollectionDataError(error);
    await this.collectionRepository.replaceLayout(collection.id, rows);
    return new Collection(await this.collectionRepository.findById(collection.id));
  }
}

module.exports = {
  ListMyCollections,
  CreateCollection,
  GetCollection,
  UpdateCollection,
  DeleteCollection,
  AddCollectionItem,
  RemoveCollectionItem,
  SetCollectionLayout,
};
