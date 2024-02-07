CREATE TABLE IF NOT EXISTS "step_histories" (
	"x" varchar(256) NOT NULL,
	"steps" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "step_histories_x_user_id_pk" PRIMARY KEY("x","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "step_histories" ADD CONSTRAINT "step_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
