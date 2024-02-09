CREATE TABLE `step_histories` (
	`x` text(256) NOT NULL,
	`steps` integer NOT NULL,
	`user_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `x`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(256)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text(256) NOT NULL,
	`last_name` text(256) NOT NULL,
	`steps` integer DEFAULT 0 NOT NULL,
	`team_id` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
