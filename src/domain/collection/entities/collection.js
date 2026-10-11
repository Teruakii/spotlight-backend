const MAX_DAYS = 30;
const START_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function averageRating(reviews = []) {
  if (!reviews.length) return null;
  return Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
}

function toItem(record) {
  const { place } = record;
  return {
    id: record.id,
    day: record.day,
    position: record.position,
    startTime: record.startTime ?? null,
    place: {
      id: place.id,
      name: place.name,
      status: place.status,
      address: place.address ?? null,
      category: place.category ? { id: place.category.id, name: place.category.name } : null,
      imageUrl: place.images?.[0]?.imageUrl ?? null,
      rating: averageRating(place.reviews),
      reviewCount: place.reviews?.length ?? 0,
    },
  };
}

class Collection {
  constructor({ id, userId, name, description, isPrivate, createdAt, updatedAt, items }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.description = description ?? null;
    this.isPrivate = isPrivate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.items = (items || []).map(toItem);
  }

  isOwnedBy(userId) {
    return this.userId === userId;
  }

  canBeViewedBy(user) {
    return !this.isPrivate || Boolean(user && this.isOwnedBy(user.id));
  }

  // Viewers other than the owner only see places that are still published.
  visibleTo(user) {
    if (user && this.isOwnedBy(user.id)) return this;
    return { ...this, items: this.items.filter((item) => item.place.status === "approved") };
  }
}

// Summary row for "my collections" lists.
function toCollectionSummary(record) {
  const items = record.items || [];
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? null,
    isPrivate: record.isPrivate,
    itemCount: items.length,
    dayCount: items.reduce((max, item) => Math.max(max, item.day), 0),
    coverImages: items
      .map((item) => item.place?.images?.[0]?.imageUrl)
      .filter(Boolean)
      .slice(0, 2),
    updatedAt: record.updatedAt,
  };
}

// Turns a requested layout ([{ id, day, startTime? }] in display order) into
// rows with positions. Returns { rows } or { error } when the layout does not
// list every existing item exactly once or has an invalid day/time.
function planLayout(existingItemIds, requested) {
  const existing = new Set(existingItemIds);
  const seen = new Set();
  const nextPosition = new Map();
  const rows = [];

  for (const entry of requested) {
    if (!existing.has(entry.id)) return { error: `Item ${entry.id} is not in this collection` };
    if (seen.has(entry.id)) return { error: `Item ${entry.id} is listed more than once` };
    if (!Number.isInteger(entry.day) || entry.day < 1 || entry.day > MAX_DAYS) {
      return { error: `Day must be between 1 and ${MAX_DAYS}` };
    }
    const startTime = entry.startTime ?? null;
    if (startTime !== null && !START_TIME.test(startTime)) {
      return { error: "Start time must be HH:MM (24-hour)" };
    }
    seen.add(entry.id);
    const position = nextPosition.get(entry.day) ?? 0;
    nextPosition.set(entry.day, position + 1);
    rows.push({ id: entry.id, day: entry.day, position, startTime });
  }

  if (seen.size !== existing.size) return { error: "Layout must include every item in the collection" };
  return { rows };
}

Collection.MAX_DAYS = MAX_DAYS;
Collection.START_TIME = START_TIME;

module.exports = { Collection, toCollectionSummary, planLayout };
