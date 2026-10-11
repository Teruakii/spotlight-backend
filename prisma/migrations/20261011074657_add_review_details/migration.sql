-- AlterTable
ALTER TABLE `reviews` ADD COLUMN `access_rating` TINYINT NULL,
    ADD COLUMN `atmosphere_rating` TINYINT NULL,
    ADD COLUMN `experience_rating` TINYINT NULL,
    ADD COLUMN `value_rating` TINYINT NULL;

-- CreateTable
CREATE TABLE `review_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,

    INDEX `review_images_review_id_idx`(`review_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_helpful_votes` (
    `review_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `review_helpful_votes_user_id_idx`(`user_id`),
    PRIMARY KEY (`review_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review_images` ADD CONSTRAINT `review_images_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_helpful_votes` ADD CONSTRAINT `review_helpful_votes_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_helpful_votes` ADD CONSTRAINT `review_helpful_votes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
