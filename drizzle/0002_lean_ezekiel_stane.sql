CREATE TABLE "article_bookmarks" (
	"user_id" text NOT NULL,
	"article_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_bookmarks" ADD CONSTRAINT "article_bookmarks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_bookmarks_user_idx" ON "article_bookmarks" USING btree ("user_id","created_at");