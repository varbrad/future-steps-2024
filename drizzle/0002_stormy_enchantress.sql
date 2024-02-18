CREATE TABLE `action_histories` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`last_run` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
