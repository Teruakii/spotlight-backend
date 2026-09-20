class ListCategories {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute() {
    return this.categoryRepository.findAll();
  }
}

module.exports = ListCategories;
