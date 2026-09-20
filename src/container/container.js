const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

// --- Infra adapters ---
const PrismaUserRepository = require("../infra/persistence/prisma-user-repository");
const PrismaPlaceRepository = require("../infra/persistence/prisma-place-repository");
const PrismaReviewRepository = require("../infra/persistence/prisma-review-repository");
const PrismaCategoryRepository = require("../infra/persistence/prisma-category-repository");
const PrismaPlaceImageRepository = require("../infra/persistence/prisma-place-image-repository");
const PrismaPlaceTransportRepository = require("../infra/persistence/prisma-place-transport-repository");
const PrismaRoleRepository = require("../infra/persistence/prisma-role-repository");
const BcryptPasswordHasher = require("../infra/security/bcrypt-password-hasher");
const JwtTokenService = require("../infra/security/jwt-token-service");

// --- User / Auth use cases ---
const RegisterUser = require("../domain/user/use-cases/register-user");
const GetUserById = require("../domain/user/use-cases/get-user-by-id");
const CheckEmailAvailability = require("../domain/user/use-cases/check-email-availability");
const Login = require("../domain/auth/use-cases/login");

// --- Place use cases ---
const CreatePlace = require("../domain/place/use-cases/create-place");
const GetPlaceById = require("../domain/place/use-cases/get-place-by-id");
const ListPlaces = require("../domain/place/use-cases/list-places");
const UpdatePlace = require("../domain/place/use-cases/update-place");
const DeletePlace = require("../domain/place/use-cases/delete-place");
const ApprovePlace = require("../domain/place/use-cases/approve-place");
const RejectPlace = require("../domain/place/use-cases/reject-place");
const AddPlaceImage = require("../domain/place/use-cases/add-place-image");
const DeletePlaceImage = require("../domain/place/use-cases/delete-place-image");
const AddPlaceTransport = require("../domain/place/use-cases/add-place-transport");

// --- Category use cases ---
const ListCategories = require("../domain/place/use-cases/list-categories");
const CreateCategory = require("../domain/place/use-cases/create-category");
const UpdateCategory = require("../domain/place/use-cases/update-category");
const DeleteCategory = require("../domain/place/use-cases/delete-category");

// --- Review use cases ---
const CreateReview = require("../domain/review/use-cases/create-review");
const ListReviewsForPlace = require("../domain/review/use-cases/list-reviews-for-place");
const UpdateReview = require("../domain/review/use-cases/update-review");
const DeleteReview = require("../domain/review/use-cases/delete-review");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET env var is required");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL env var is required");
}
const dbUrl = new URL(process.env.DATABASE_URL);

function buildSslOptions(url) {
  if (process.env.DATABASE_CA_CERT) {
    return { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, "\n") };
  }
  const mode = (url.searchParams.get("ssl-mode") || "").toUpperCase();
  if (process.env.DATABASE_SSL === "true" || mode === "REQUIRED") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ""),
  ssl: buildSslOptions(dbUrl),
});

const prisma = new PrismaClient({ adapter });

// --- Adapters ---
const userRepository = new PrismaUserRepository(prisma);
const placeRepository = new PrismaPlaceRepository(prisma);
const reviewRepository = new PrismaReviewRepository(prisma);
const categoryRepository = new PrismaCategoryRepository(prisma);
const imageRepository = new PrismaPlaceImageRepository(prisma);
const transportRepository = new PrismaPlaceTransportRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(
  process.env.JWT_SECRET,
  process.env.JWT_EXPIRES_IN || "1h",
);

// --- User / Auth use cases ---
const registerUser = new RegisterUser(userRepository, passwordHasher, roleRepository);
const getUserById = new GetUserById(userRepository);
const checkEmailAvailability = new CheckEmailAvailability(userRepository);
const login = new Login(userRepository, passwordHasher, tokenService);

// --- Place use cases ---
const createPlace = new CreatePlace(placeRepository, categoryRepository);
const getPlaceById = new GetPlaceById(placeRepository);
const listPlaces = new ListPlaces(placeRepository);
const updatePlace = new UpdatePlace(placeRepository, categoryRepository);
const deletePlace = new DeletePlace(placeRepository);
const approvePlace = new ApprovePlace(placeRepository);
const rejectPlace = new RejectPlace(placeRepository);
const addPlaceImage = new AddPlaceImage(placeRepository, imageRepository);
const deletePlaceImage = new DeletePlaceImage(placeRepository, imageRepository);
const addPlaceTransport = new AddPlaceTransport(placeRepository, transportRepository);

// --- Category use cases ---
const listCategories = new ListCategories(categoryRepository);
const createCategory = new CreateCategory(categoryRepository);
const updateCategory = new UpdateCategory(categoryRepository);
const deleteCategory = new DeleteCategory(categoryRepository);

// --- Review use cases ---
const createReview = new CreateReview(reviewRepository, placeRepository);
const listReviewsForPlace = new ListReviewsForPlace(reviewRepository);
const updateReview = new UpdateReview(reviewRepository);
const deleteReview = new DeleteReview(reviewRepository);

module.exports = {
  prisma,
  tokenService,

  registerUser,
  getUserById,
  checkEmailAvailability,
  login,

  createPlace,
  getPlaceById,
  listPlaces,
  updatePlace,
  deletePlace,
  approvePlace,
  rejectPlace,
  addPlaceImage,
  deletePlaceImage,
  addPlaceTransport,

  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  createReview,
  listReviewsForPlace,
  updateReview,
  deleteReview,
};


