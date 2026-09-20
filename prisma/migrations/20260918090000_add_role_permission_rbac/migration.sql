-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permissions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `role_permissions_permission_id_idx` ON `role_permissions`(`permission_id`);

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed roles: ชื่อต้องตรงกับค่า enum เดิม ('admin', 'user') เป๊ะๆ เพราะขั้นตอน backfill
-- ด้านล่างจะ join ด้วยชื่อนี้เพื่อย้ายข้อมูลของ user ที่มีอยู่แล้วเข้า role_id
INSERT INTO `roles` (`name`, `description`, `updated_at`) VALUES
  ('admin', 'Full administrative access', CURRENT_TIMESTAMP(3)),
  ('user', 'Standard authenticated user', CURRENT_TIMESTAMP(3));

-- Seed permissions: ตั้งชื่อตาม action ที่ถูก gate ด้วย requireRole('admin') อยู่แล้วในโค้ดเดิม
INSERT INTO `permissions` (`name`, `description`, `updated_at`) VALUES
  ('category:manage', 'Create, update, and delete categories', CURRENT_TIMESTAMP(3)),
  ('place:manage_any', 'Edit, delete, or manage media on any place regardless of ownership', CURRENT_TIMESTAMP(3)),
  ('place:moderate', 'View the pending queue and approve/reject places', CURRENT_TIMESTAMP(3)),
  ('review:manage_any', 'Delete any review regardless of ownership', CURRENT_TIMESTAMP(3));

-- Grant ทุก permission ให้ role admin
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r CROSS JOIN `permissions` p WHERE r.name = 'admin';

-- === จุดที่ต้องระวังที่สุดของ migration นี้: ย้าย users.role (enum) -> users.role_id (FK) ===
-- ทำเป็น 4 ขั้นเรียงลำดับ ห้ามข้ามขั้นตอน ไม่งั้นข้อมูล user ที่มีอยู่แล้วจะพัง:

-- ขั้น 1: เพิ่ม column role_id แบบ NULLABLE ก่อน (ห้ามใส่ NOT NULL ตั้งแต่แรก
-- เพราะ user เดิมที่มีอยู่แล้วยังไม่มีค่าให้ backfill เข้าไปตอนนี้)
ALTER TABLE `users` ADD COLUMN `role_id` INTEGER NULL;

-- ขั้น 2: backfill ค่า role_id ของทุก user เดิม โดย map จากค่า enum `role` เดิม
-- ไปหา id ของ role ที่ชื่อตรงกันใน table roles ที่เพิ่ง seed ไป
UPDATE `users` u JOIN `roles` r ON r.name = u.role SET u.role_id = r.id;

-- ขั้น 3: ตอนนี้ทุกแถวมีค่า role_id แล้ว ปลอดภัยที่จะบังคับ NOT NULL
ALTER TABLE `users` MODIFY COLUMN `role_id` INTEGER NOT NULL;

-- ขั้น 4: ลบ column enum เดิมทิ้ง (ข้อมูลย้ายไป role_id ครบแล้ว)
ALTER TABLE `users` DROP COLUMN `role`;

-- CreateIndex
CREATE INDEX `users_role_id_idx` ON `users`(`role_id`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
