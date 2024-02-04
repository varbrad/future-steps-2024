CREATE TABLE IF NOT EXISTS "teams" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(256)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" integer PRIMARY KEY NOT NULL,
	"first_name" varchar(256),
	"last_name" varchar(256)
);
