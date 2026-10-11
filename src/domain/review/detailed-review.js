// Shape returned by the /reviews/detailed endpoints. Kept separate from the
// Review entity so the original review endpoints keep their exact response.
function toDetailedReview(record, viewerId = null) {
  return {
    id: record.id,
    placeId: record.placeId,
    userId: record.userId,
    rating: record.rating,
    comment: record.comment,
    createdAt: record.createdAt,
    author: record.user ? { firstName: record.user.firstName, lastName: record.user.lastName } : null,
    subRatings: {
      experience: record.experienceRating ?? null,
      value: record.valueRating ?? null,
      access: record.accessRating ?? null,
      atmosphere: record.atmosphereRating ?? null,
    },
    images: (record.images || []).map((image) => ({ id: image.id, imageUrl: image.imageUrl })),
    helpfulCount: record._count?.helpfulVotes ?? 0,
    helpfulByMe: viewerId !== null && (record.helpfulVotes || []).some((vote) => vote.userId === viewerId),
  };
}

module.exports = { toDetailedReview };
