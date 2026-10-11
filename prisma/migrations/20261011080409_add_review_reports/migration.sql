-- CreateTable
CREATE TABLE `review_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER NOT NULL,
    `reporter_id` INTEGER NOT NULL,
    `reason` ENUM('spam', 'offensive', 'misleading', 'other') NOT NULL,
    `details` TEXT NULL,
    `status` ENUM('open', 'dismissed') NOT NULL DEFAULT 'open',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,
    `resolved_by_id` INTEGER NULL,

    INDEX `review_reports_status_idx`(`status`),
    INDEX `review_reports_reporter_id_idx`(`reporter_id`),
    INDEX `review_reports_resolved_by_id_idx`(`resolved_by_id`),
    UNIQUE INDEX `review_reports_review_id_reporter_id_key`(`review_id`, `reporter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review_reports` ADD CONSTRAINT `review_reports_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_reports` ADD CONSTRAINT `review_reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_reports` ADD CONSTRAINT `review_reports_resolved_by_id_fkey` FOREIGN KEY (`resolved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
