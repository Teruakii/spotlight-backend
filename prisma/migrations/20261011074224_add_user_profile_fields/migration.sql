-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar_url` VARCHAR(500) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `cover_url` VARCHAR(500) NULL,
    ADD COLUMN `location` VARCHAR(100) NULL;
