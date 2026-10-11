# Spotlight Backend

REST API for Spotlight, an app for discovering and reviewing travel attractions and restaurants. It is used by [spotlight-frontend](https://github.com/Teruakii/spotlight-frontend).

- **Stack:** Node.js, Express 5, Prisma 7 (MariaDB adapter), MySQL / MariaDB, zod, JWT, bcrypt
- **Tests:** Jest. Unit tests run at the use-case level against fake repositories, so no database is needed.

## Getting started

```bash
npm install                 # also runs prisma generate
cp .env.example .env        # then edit the values in .env
npx prisma migrate deploy   # create/update tables from the migrations
npm run dev                 # http://localhost:5000
```

MySQL (for example from XAMPP) must be running, and the database named in `DATABASE_URL` must already exist (an empty one is fine).

### Environment variables (`.env`)

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `mysql://root:password@localhost:3306/trip_review_db` | Database connection |
| `JWT_SECRET` | a long random string | Signs login tokens. Required: the server refuses to start without it |
| `JWT_EXPIRES_IN` | `1h` | Token lifetime |
| `PORT` | `5000` | API port |
| `FRONTEND_URL` | `http://localhost:3000` | URL of the web app |

### Common commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the server with auto-reload (nodemon) |
| `npm start` | Start the server |
| `npm test` | Run all tests |
| `npx prisma migrate deploy` | Apply pending migrations to the database |
| `npx prisma migrate status` | Show which migrations the database has applied |
| `npm run db:migration:create -- <name>` | Create a migration from changes to `prisma/schema.prisma` (see below) |

## Changing the database (migrations)

1. Edit `prisma/schema.prisma`.
2. Run `npm run db:migration:create -- add_something`. It compares your edited schema with the last committed version and writes `prisma/migrations/<timestamp>_add_something/migration.sql`. **It never connects to a database.**
3. Read the generated SQL, then commit the schema and the migration together.
4. Run `npx prisma migrate deploy` against the database you want to update.

Back up the database before deploying migrations, for example: `mysqldump -u root --databases trip_review_db > backup.sql`

## Project structure

The code follows a clean-architecture layout. Business rules live in `domain` and know nothing about Express or Prisma.

```
server.js                     Express entry point: wires routes and the error handler
src/
  container/container.js      Builds every repository and use case and hands them to the routes (dependency injection)
  domain/                     Business rules, one folder per area
    <area>/entities/          Core objects such as Place, Review, User, Collection
    <area>/use-cases/         One action each (validate input with zod → check permissions → call repositories)
    <area>/ports/             Repository interfaces the use cases depend on
    <area>/errors/            Errors that carry their HTTP status
  infra/
    persistence/              Prisma implementations of the repositories
    security/                 bcrypt, JWT
  interfaces/http/
    routes/                   URL → middleware → controller
    controllers/              Turn a request into a use-case call and send the response
    middlewares/              authenticate, optional-authenticate, require-permission, error-handler
prisma/
  schema.prisma               Table definitions
  migrations/                 SQL for each migration
tests/domain/                 Use-case unit tests (fake repositories live in __fakes__)
scripts/create-migration.js   Migration generator
```

**Request flow:** `routes` → `middlewares` (token and permission checks) → `controller` → `use case` (validation and rules) → `repository` (Prisma) → database. When a use case throws an error with a `statusCode`, `error-handler` responds with `{ message, details? }` and that status.

### Adding an endpoint

1. Write the use case in `src/domain/<area>/use-cases/`. If it needs new data access, add the method to `ports/`.
2. Implement that method in `src/infra/persistence/`.
3. Instantiate the use case in `src/container/container.js` and export it.
4. Add a controller and a route.
5. Write tests in `tests/domain/` using fake repositories.

## Permissions (RBAC)

Each user has a role (`admin` or `user`), and each role has a set of permissions:

| Permission | Allows |
|---|---|
| `category:manage` | Create, edit and delete categories |
| `place:manage_any` | Edit or delete places created by other users |
| `place:moderate` | Pending-place queue, approve/reject, dashboard stats |
| `review:manage_any` | Delete other users' reviews, handle reported reviews |
| `user:manage` | List users, suspend and reinstate accounts |

The `admin` role has all of them. To make a user an admin:
`UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE email = '...';`

## API

All paths start with `/api`. Endpoints that need a login expect the header `Authorization: Bearer <token>`. Get the token from `POST /api/auth/login`.

🔒 = login required · 🔓 = login optional (the result can differ when logged in) · 🛡 = permission required

### Auth and users

| Method | Path | | Description |
|---|---|---|---|
| POST | `/auth/register` | | Sign up `{ firstName, lastName, email, password }` |
| POST | `/auth/login` | | Log in `{ email, password }` → `{ token, user }` |
| GET | `/auth/check-email?email=` | | Check whether an email is available |
| GET | `/users/me` | 🔒 | Current user and permissions |
| GET / PATCH | `/users/me/profile` | 🔒 | Read or edit the profile `{ firstName?, lastName?, bio?, location?, avatarUrl?, coverUrl? }`, with stats |
| GET | `/users/me/reviews` | 🔒 | My reviews, with place names |
| GET | `/users/me/saved-places` | 🔒 | Saved places |
| GET | `/users/me/recommendations?limit=` | 🔒 | Recommended places (`reason`: `saved-category` or `top-rated`) |
| POST | `/users/me/password` | 🔒 | Change password `{ currentPassword, newPassword }` |
| DELETE | `/users/me` | 🔒 | Delete account `{ password }`. Returns 409 while the user still owns places |

### Places and categories

| Method | Path | | Description |
|---|---|---|---|
| GET | `/places?categoryId=&status=&mine=` | 🔓 | List places (the public only sees approved ones) |
| GET | `/places/nearby?lat=&lng=&radiusKm=&categoryId=&limit=` | | Places near a point, nearest first, with `distanceKm` |
| GET | `/places/:id` | 🔓 | Place details |
| GET | `/places/:id/nearby?radiusKm=&categoryId=&limit=` | 🔓 | Places near this place (used for Nearby Eats) |
| POST / PATCH / DELETE | `/places`, `/places/:id` | 🔒 | Create, edit, delete (new places start as pending) |
| POST / DELETE | `/places/:id/images`, `/places/:id/images/:imageId` | 🔒 | Add or remove photos |
| POST | `/places/:id/transports` | 🔒 | Add a way to get there |
| PUT / DELETE | `/places/:id/save` | 🔒 | Save or unsave |
| POST | `/places/:id/views` | 🔓 | Record a visit (the detail page calls it once per load) |
| GET | `/places/pending` | 🛡 `place:moderate` | Approval queue |
| POST | `/places/:id/approve`, `/places/:id/reject` | 🛡 `place:moderate` | Approve or reject |
| GET | `/categories` | | List categories |
| POST / PATCH / DELETE | `/categories`, `/categories/:id` | 🛡 `category:manage` | Manage categories |

### Reviews

| Method | Path | | Description |
|---|---|---|---|
| GET / POST | `/places/:placeId/reviews` | 🔒 (POST) | Original reviews `{ rating, comment? }` |
| GET | `/places/:placeId/reviews/detailed` | 🔓 | Reviews with `images`, `subRatings`, `helpfulCount`, `helpfulByMe` |
| POST | `/places/:placeId/reviews/detailed` | 🔒 | `{ rating, comment?, experienceRating?, valueRating?, accessRating?, atmosphereRating?, imageUrls?: string[≤4] }` |
| PATCH / DELETE | `/reviews/:id` | 🔒 | Edit or delete a review (author or `review:manage_any`) |
| PUT / DELETE | `/reviews/:id/helpful` | 🔒 | Mark or unmark as helpful (not on your own review) |
| POST | `/reviews/:id/report` | 🔒 | Report `{ reason: spam\|offensive\|misleading\|other, details? }` |

### Collections (trips)

| Method | Path | | Description |
|---|---|---|---|
| GET / POST | `/collections` | 🔒 | My collections / create one `{ name, description?, isPrivate? }` |
| GET | `/collections/:id` | 🔓 | View a collection. Private ones are visible to their owner only; everyone else gets 404 |
| PATCH / DELETE | `/collections/:id` | 🔒 | Edit or delete |
| POST | `/collections/:id/items` | 🔒 | Add a place `{ placeId, day?, startTime?: "HH:MM" }` at the end of that day |
| DELETE | `/collections/:id/items/:itemId` | 🔒 | Remove a place |
| PUT | `/collections/:id/layout` | 🔒 | Replace the whole layout `{ items: [{ id, day, startTime? }] }`. Array order is the order within each day, and every item must be included |

### Admin

| Method | Path | | Description |
|---|---|---|---|
| GET | `/admin/stats?period=7D\|30D\|12M` | 🛡 `place:moderate` | Totals, counts for the period, visits/reviews series, category mix, recent activity |
| GET | `/admin/reports` | 🛡 `review:manage_any` | Reported reviews, grouped per review |
| POST | `/admin/reviews/:id/moderation` | 🛡 `review:manage_any` | `{ action: "dismiss" \| "remove" }` |
| GET | `/admin/users?search=&status=all\|active\|suspended` | 🛡 `user:manage` | List users |
| PATCH | `/admin/users/:id/suspension` | 🛡 `user:manage` | `{ suspended: boolean }` (cannot suspend yourself or another admin) |

## Known limitations

- The first 4 migrations don't fully match `schema.prisma` (some index names, and `places` has no `status` index). This doesn't affect behaviour.
- Changing a password doesn't revoke tokens that were already issued; they stay valid until they expire.
- Recommendations load every approved place into memory. With a large dataset this should move to SQL.

## License

<!-- TODO: choose a license, e.g. MIT -->
