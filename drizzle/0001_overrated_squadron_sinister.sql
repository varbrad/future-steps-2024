ALTER TABLE users ADD `username` text(256);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);