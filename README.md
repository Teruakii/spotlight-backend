# Spotlight Backend

RESTful API backend built with **Node.js**, **Express**, and **Prisma**.
The architecture follows **Clean Architecture** and **Hexagonal (Ports & Adapters)**
principles for high testability, scalability, and maintainability.

## Tech Stack

- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Jest](https://jestjs.io/) for testing
<!-- TODO: เพิ่มฐานข้อมูลที่ใช้ เช่น PostgreSQL / MySQL / SQLite -->

## Project Structure

```
.
├── prisma/            # Prisma schema and migrations
├── src/               # Application source code
├── tests/
│   └── domain/        # Domain layer unit tests
├── .env.example       # Example environment variables
├── jest.config.js     # Jest configuration
├── prisma.config.js   # Prisma configuration
└── server.js          # Application entry point
```
<!-- TODO: เปิดโฟลเดอร์ src แล้วเพิ่มโครงสร้างย่อยลงไป เช่น domain/, application/, infrastructure/ -->

## Architecture

The project separates concerns into layers, with dependencies pointing inward:

- **Domain** – entities and core business rules (no framework dependencies)
- **Application** – use cases that orchestrate the domain
- **Adapters / Infrastructure** – HTTP (Express) and persistence (Prisma)

Ports define what the core needs; adapters implement them. This makes it easy
to swap infrastructure and to test business logic in isolation.

## Getting Started

### Prerequisites

- Node.js <!-- TODO: ใส่เวอร์ชัน เช่น >= 20 -->
- npm
- A running database supported by Prisma

### Installation

```bash
git clone https://github.com/Teruakii/spotlight-backend.git
cd spotlight-backend
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

Then edit `.env` with your own values.

<!-- TODO: ตารางอธิบายตัวแปรจาก .env.example -->
| Variable       | Description                  |
| -------------- | ---------------------------- |
| `DATABASE_URL` | Database connection string   |
| `PORT`         | Server port                  |

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Run the Server

```bash
npm run dev     # TODO: ตรวจชื่อ script ใน package.json
npm start
```

## Testing

```bash
npm test
```

## API Endpoints

<!-- TODO: เพิ่มเมื่อมี routes แล้ว -->
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | `/`      | ...         |

## License

<!-- TODO: เลือก license เช่น MIT -->
