-- CreateTable
CREATE TABLE `collections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `collections_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collection_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `collection_id` INTEGER NOT NULL,
    `place_id` INTEGER NOT NULL,
    `day` INTEGER NOT NULL DEFAULT 1,
    `position` INTEGER NOT NULL,
    `start_time` CHAR(5) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `collection_items_collection_id_day_position_idx`(`collection_id`, `day`, `position`),
    INDEX `collection_items_place_id_idx`(`place_id`),
    UNIQUE INDEX `collection_items_collection_id_place_id_key`(`collection_id`, `place_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_collection_id_fkey` FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
