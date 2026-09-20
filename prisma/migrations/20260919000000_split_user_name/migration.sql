ALTER TABLE `users`
  ADD COLUMN `first_name` VARCHAR(191) NULL,
  ADD COLUMN `last_name` VARCHAR(191) NULL;

UPDATE `users`
SET
  `first_name` = SUBSTRING_INDEX(TRIM(`name`), ' ', 1),
  `last_name` = TRIM(SUBSTRING(TRIM(`name`), CHAR_LENGTH(SUBSTRING_INDEX(TRIM(`name`), ' ', 1)) + 1));

ALTER TABLE `users`
  MODIFY COLUMN `first_name` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `last_name` VARCHAR(191) NOT NULL;

ALTER TABLE `users` DROP COLUMN `name`;
