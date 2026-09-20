ALTER TABLE `places`
  CHANGE COLUMN `entry_fee` `price_info` VARCHAR(191) NULL,
  ADD COLUMN `price_level` INTEGER NULL;
