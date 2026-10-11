# Spotlight Backend

REST API ของ Spotlight แอปรีวิวสถานที่ท่องเที่ยวและร้านอาหาร ใช้คู่กับ [spotlight-frontend](https://github.com/Teruakii/spotlight-frontend)

- **Stack:** Node.js, Express 5, Prisma 7 (MariaDB adapter), MySQL / MariaDB, zod, JWT, bcrypt
- **Tests:** Jest (unit test ระดับ use case ใช้ fake repository ไม่ต้องมี database)

## เริ่มต้นใช้งาน

```bash
npm install                 # จะรัน prisma generate ให้อัตโนมัติ
cp .env.example .env        # แล้วแก้ค่าใน .env
npx prisma migrate deploy   # สร้าง/อัปเดตตารางตาม migrations
npm run dev                 # http://localhost:5000
```

ต้องเปิด MySQL (เช่น XAMPP) และสร้าง database ว่างตามชื่อใน `DATABASE_URL` ไว้ก่อน

### ตัวแปรใน `.env`

| ตัวแปร | ตัวอย่าง | ใช้ทำอะไร |
|---|---|---|
| `DATABASE_URL` | `mysql://root:password@localhost:3306/trip_review_db` | การเชื่อมต่อ database |
| `JWT_SECRET` | สตริงสุ่มยาว ๆ | ใช้เซ็น token ตอนล็อกอิน (ต้องมี ไม่อย่างนั้น server ไม่ยอมเริ่ม) |
| `JWT_EXPIRES_IN` | `1h` | อายุ token |
| `PORT` | `5000` | port ของ API |
| `FRONTEND_URL` | `http://localhost:3000` | URL ของหน้าเว็บ |

### คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รัน server แบบ auto-reload (nodemon) |
| `npm start` | รัน server ปกติ |
| `npm test` | รัน test ทั้งหมด |
| `npx prisma migrate deploy` | apply migration ที่ยังไม่ได้รันลง database |
| `npx prisma migrate status` | ดูว่า database รัน migration ถึงตัวไหนแล้ว |
| `npm run db:migration:create -- <ชื่อ>` | สร้าง migration ใหม่จากการแก้ `prisma/schema.prisma` (ดูหัวข้อถัดไป) |

## การแก้ database (migration)

1. แก้ `prisma/schema.prisma`
2. รัน `npm run db:migration:create -- add_something` ระบบจะเทียบ schema ที่แก้กับเวอร์ชันล่าสุดที่ commit ไว้ แล้วเขียนไฟล์ `prisma/migrations/<เวลา>_add_something/migration.sql` ให้ **โดยไม่ต่อ database เลย**
3. เปิดไฟล์ SQL ตรวจดูก่อน แล้ว commit ทั้ง schema และ migration พร้อมกัน
4. รัน `npx prisma migrate deploy` กับ database ที่ต้องการ

ควร backup database ก่อน deploy migration ทุกครั้ง เช่น `mysqldump -u root --databases trip_review_db > backup.sql`

## โครงสร้างโปรเจกต์

ใช้แนวทาง clean architecture: กฎทางธุรกิจอยู่ใน `domain` และไม่รู้จัก Express หรือ Prisma

```
server.js                     จุดเริ่ม Express, ผูก routes กับ error handler
src/
  container/container.js      สร้าง repository และ use case ทั้งหมด แล้วส่งให้ routes (dependency injection)
  domain/                     กฎทางธุรกิจ แยกตามเรื่อง
    <เรื่อง>/entities/          object หลัก เช่น Place, Review, User, Collection
    <เรื่อง>/use-cases/         การกระทำแต่ละอย่าง (validate input ด้วย zod → ตรวจสิทธิ์ → เรียก repository)
    <เรื่อง>/ports/             interface ของ repository ที่ use case ต้องใช้
    <เรื่อง>/errors/            error ที่มี HTTP status ในตัว
  infra/
    persistence/              repository ที่ใช้ Prisma จริง
    security/                 bcrypt, JWT
  interfaces/http/
    routes/                   ผูก URL → middleware → controller
    controllers/              แปลง request เป็นการเรียก use case แล้วตอบกลับ
    middlewares/              authenticate, optional-authenticate, require-permission, error-handler
prisma/
  schema.prisma               โครงสร้างตาราง
  migrations/                 ไฟล์ SQL ของแต่ละ migration
tests/domain/                 unit test ของ use case (ใช้ fake repository ใน __fakes__)
scripts/create-migration.js   ตัวสร้าง migration
```

**ลำดับการทำงานของ request:** `routes` → `middlewares` (ตรวจ token และสิทธิ์) → `controller` → `use case` (ตรวจข้อมูลและกฎ) → `repository` (Prisma) → database ถ้า use case throw error ที่มี `statusCode` ตัว `error-handler` จะตอบ `{ message, details? }` พร้อม status นั้น

### เพิ่ม endpoint ใหม่

1. เขียน use case ใน `src/domain/<เรื่อง>/use-cases/` ถ้าต้องใช้ข้อมูลใหม่ ให้เพิ่ม method ใน `ports/` ด้วย
2. implement method นั้นใน `src/infra/persistence/`
3. สร้าง instance ใน `src/container/container.js` แล้ว export
4. เพิ่ม controller และ route
5. เขียน test ใน `tests/domain/` โดยใช้ fake repository

## สิทธิ์ (RBAC)

ผู้ใช้แต่ละคนมี role (`admin`, `user`) และแต่ละ role มี permission ดังนี้:

| Permission | ใช้กับ |
|---|---|
| `category:manage` | สร้าง/แก้/ลบหมวด |
| `place:manage_any` | แก้/ลบสถานที่ของคนอื่น |
| `place:moderate` | คิวสถานที่รออนุมัติ, approve/reject, ดู dashboard stats |
| `review:manage_any` | ลบรีวิวของคนอื่น, จัดการรีวิวที่ถูกรายงาน |
| `user:manage` | ดูรายชื่อผู้ใช้, ระงับ/คืนสิทธิ์บัญชี |

role `admin` มีครบทุกข้อ ตั้งให้ผู้ใช้เป็น admin ได้ด้วย SQL:
`UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE email = '...';`

## API

ทุก path ขึ้นต้นด้วย `/api` ส่วน endpoint ที่ต้องล็อกอินให้ส่ง header `Authorization: Bearer <token>` (token ได้จาก `POST /api/auth/login`)

🔒 = ต้องล็อกอิน · 🔓 = ล็อกอินหรือไม่ก็ได้ (ถ้าล็อกอิน ผลอาจต่างออกไป) · 🛡 = ต้องมี permission

### Auth และผู้ใช้

| Method | Path | | คำอธิบาย |
|---|---|---|---|
| POST | `/auth/register` | | สมัคร `{ firstName, lastName, email, password }` |
| POST | `/auth/login` | | ล็อกอิน `{ email, password }` → `{ token, user }` |
| GET | `/auth/check-email?email=` | | เช็กว่า email ว่างหรือไม่ |
| GET | `/users/me` | 🔒 | ข้อมูลตัวเอง + permissions |
| GET / PATCH | `/users/me/profile` | 🔒 | ดู/แก้ profile `{ firstName?, lastName?, bio?, location?, avatarUrl?, coverUrl? }` พร้อม stats |
| GET | `/users/me/reviews` | 🔒 | รีวิวของฉัน พร้อมชื่อสถานที่ |
| GET | `/users/me/saved-places` | 🔒 | สถานที่ที่ save ไว้ |
| GET | `/users/me/recommendations?limit=` | 🔒 | สถานที่แนะนำ (`reason`: `saved-category` หรือ `top-rated`) |
| POST | `/users/me/password` | 🔒 | เปลี่ยนรหัส `{ currentPassword, newPassword }` |
| DELETE | `/users/me` | 🔒 | ลบบัญชี `{ password }` (ถ้ายังมีสถานที่ที่ตัวเองสร้างจะได้ 409) |

### สถานที่และหมวด

| Method | Path | | คำอธิบาย |
|---|---|---|---|
| GET | `/places?categoryId=&status=&mine=` | 🔓 | รายการสถานที่ (คนทั่วไปเห็นเฉพาะที่ approved) |
| GET | `/places/nearby?lat=&lng=&radiusKm=&categoryId=&limit=` | | สถานที่ใกล้พิกัด เรียงตามระยะ มี `distanceKm` |
| GET | `/places/:id` | 🔓 | รายละเอียดสถานที่ |
| GET | `/places/:id/nearby?radiusKm=&categoryId=&limit=` | 🔓 | สถานที่ใกล้สถานที่นี้ (ใช้ทำ Nearby Eats) |
| POST / PATCH / DELETE | `/places`, `/places/:id` | 🔒 | สร้าง/แก้/ลบ (สร้างใหม่จะอยู่สถานะ pending) |
| POST / DELETE | `/places/:id/images`, `/places/:id/images/:imageId` | 🔒 | เพิ่ม/ลบรูป |
| POST | `/places/:id/transports` | 🔒 | เพิ่มวิธีเดินทาง |
| PUT / DELETE | `/places/:id/save` | 🔒 | save/ยกเลิก save |
| POST | `/places/:id/views` | 🔓 | นับการเข้าชม (หน้า detail เรียกครั้งเดียวต่อการเปิดหน้า) |
| GET | `/places/pending` | 🛡 `place:moderate` | คิวรออนุมัติ |
| POST | `/places/:id/approve`, `/places/:id/reject` | 🛡 `place:moderate` | อนุมัติ/ปฏิเสธ |
| GET | `/categories` | | รายการหมวด |
| POST / PATCH / DELETE | `/categories`, `/categories/:id` | 🛡 `category:manage` | จัดการหมวด |

### รีวิว

| Method | Path | | คำอธิบาย |
|---|---|---|---|
| GET / POST | `/places/:placeId/reviews` | 🔒 (POST) | รีวิวแบบเดิม `{ rating, comment? }` |
| GET | `/places/:placeId/reviews/detailed` | 🔓 | รีวิวพร้อม `images`, `subRatings`, `helpfulCount`, `helpfulByMe` |
| POST | `/places/:placeId/reviews/detailed` | 🔒 | `{ rating, comment?, experienceRating?, valueRating?, accessRating?, atmosphereRating?, imageUrls?: string[≤4] }` |
| PATCH / DELETE | `/reviews/:id` | 🔒 | แก้/ลบรีวิว (เจ้าของหรือ `review:manage_any`) |
| PUT / DELETE | `/reviews/:id/helpful` | 🔒 | กด/ยกเลิก Helpful (รีวิวตัวเองไม่ได้) |
| POST | `/reviews/:id/report` | 🔒 | รายงาน `{ reason: spam\|offensive\|misleading\|other, details? }` |

### Collections (ทริป)

| Method | Path | | คำอธิบาย |
|---|---|---|---|
| GET / POST | `/collections` | 🔒 | collection ของฉัน / สร้างใหม่ `{ name, description?, isPrivate? }` |
| GET | `/collections/:id` | 🔓 | ดู collection (ถ้าเป็น private เจ้าของเท่านั้นที่เห็น คนอื่นได้ 404) |
| PATCH / DELETE | `/collections/:id` | 🔒 | แก้/ลบ |
| POST | `/collections/:id/items` | 🔒 | เพิ่มสถานที่ `{ placeId, day?, startTime?: "HH:MM" }` ต่อท้ายวันนั้น |
| DELETE | `/collections/:id/items/:itemId` | 🔒 | เอาออก |
| PUT | `/collections/:id/layout` | 🔒 | จัดใหม่ทั้งหมด `{ items: [{ id, day, startTime? }] }` ลำดับใน array คือลำดับในแต่ละวัน และต้องมีครบทุก item |

### Admin

| Method | Path | | คำอธิบาย |
|---|---|---|---|
| GET | `/admin/stats?period=7D\|30D\|12M` | 🛡 `place:moderate` | ยอดรวม, ตัวเลขในช่วงเวลา, กราฟ visits/reviews, สัดส่วนหมวด, กิจกรรมล่าสุด |
| GET | `/admin/reports` | 🛡 `review:manage_any` | รีวิวที่ถูกรายงาน จัดกลุ่มต่อรีวิว |
| POST | `/admin/reviews/:id/moderation` | 🛡 `review:manage_any` | `{ action: "dismiss" \| "remove" }` |
| GET | `/admin/users?search=&status=all\|active\|suspended` | 🛡 `user:manage` | รายชื่อผู้ใช้ |
| PATCH | `/admin/users/:id/suspension` | 🛡 `user:manage` | `{ suspended: boolean }` (ระงับตัวเองหรือ admin ไม่ได้) |

## ข้อจำกัดที่รู้อยู่

- migration 4 ตัวแรกยังไม่ตรงกับ `schema.prisma` ทุกจุด (ชื่อ index ของบางตาราง และ `places` ยังไม่มี index `status`) แต่ใช้งานได้ปกติ
- เปลี่ยนรหัสผ่านแล้ว token เก่ายังใช้ได้จนหมดอายุ
- การแนะนำสถานที่ (recommendations) ดึงสถานที่ทั้งหมดมาคำนวณในหน่วยความจำ ถ้าข้อมูลมีจำนวนมากควรย้ายไปคำนวณใน SQL

## License

<!-- TODO: เลือก license เช่น MIT -->
