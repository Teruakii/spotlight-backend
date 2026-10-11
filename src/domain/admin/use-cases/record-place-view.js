class RecordPlaceView {
  constructor(statsRepository, getPlaceById) {
    this.statsRepository = statsRepository;
    this.getPlaceById = getPlaceById;
  }

  // Only views of published places count; owners/admins previewing a pending
  // place are not visitors.
  async execute(placeId, viewer = null) {
    const place = await this.getPlaceById.execute(placeId, viewer);
    if (!place.isApproved()) return;
    await this.statsRepository.recordView(place.id, viewer ? viewer.id : null);
  }
}

module.exports = RecordPlaceView;
