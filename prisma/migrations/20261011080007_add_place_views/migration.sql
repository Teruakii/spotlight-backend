-- CreateTable
CREATE TABLE `place_views` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `place_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `place_views_created_at_idx`(`created_at`),
    INDEX `place_views_place_id_idx`(`place_id`),
    INDEX `place_views_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `place_views` ADD CONSTRAINT `place_views_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `place_views` ADD CONSTRAINT `place_views_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
