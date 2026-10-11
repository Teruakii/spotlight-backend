-- Data migration: lets admins list users and suspend/unsuspend accounts.
INSERT INTO `permissions` (`name`, `description`, `updated_at`) VALUES
  ('user:manage', 'List users and suspend or reinstate accounts', CURRENT_TIMESTAMP(3));

INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r CROSS JOIN `permissions` p
WHERE r.name = 'admin' AND p.name = 'user:manage';
