const CategoryRepository = require('../../domain/place/ports/category-repository');

class PrismaCategoryRepository extends CategoryRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findById(id) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findByName(name) {
    return this.prisma.category.findUnique({ where: { name } });
  }

  async create(data) {
    return this.prisma.category.create({ data });
  }

  async update(id, data) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id) {
    return this.prisma.category.delete({ where: { id } });
  }

  async countPlacesUsingCategory(id) {
    return this.prisma.place.count({ where: { categoryId: id } });
  }
}

module.exports = PrismaCategoryRepository;
