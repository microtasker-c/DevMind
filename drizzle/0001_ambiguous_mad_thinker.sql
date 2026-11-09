CREATE TABLE "article_contents" (
	"article_id" uuid PRIMARY KEY NOT NULL,
	"document" jsonb NOT NULL,
	"format_version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "article_contents_format_check" CHECK ("article_contents"."format_version" = 1),
	CONSTRAINT "article_contents_document_check" CHECK (jsonb_typeof("article_contents"."document") = 'array' and jsonb_array_length("article_contents"."document") between 1 and 1000 and octet_length("article_contents"."document"::text) <= 600000)
);
--> statement-breakpoint
ALTER TABLE "article_contents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "article_tags_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "article_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"cover_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"reading_minutes" integer DEFAULT 1 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "articles_status_check" CHECK ("articles"."status" in ('draft', 'published')),
	CONSTRAINT "articles_published_check" CHECK (("articles"."status" = 'draft' and "articles"."published_at" is null) or ("articles"."status" = 'published' and "articles"."published_at" is not null and length(trim("articles"."title")) > 0)),
	CONSTRAINT "articles_lengths_check" CHECK (length("articles"."title") <= 200 and length("articles"."excerpt") <= 500 and ("articles"."cover_url" is null or length("articles"."cover_url") <= 2048)),
	CONSTRAINT "articles_numbers_check" CHECK ("articles"."revision" > 0 and "articles"."reading_minutes" > 0)
);
--> statement-breakpoint
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tags_lengths_check" CHECK (length("tags"."name") between 1 and 32 and length("tags"."slug") between 1 and 64)
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "article_contents" ADD CONSTRAINT "article_contents_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_tags_tag_id_idx" ON "article_tags" USING btree ("tag_id","article_id");--> statement-breakpoint
CREATE INDEX "articles_published_feed_idx" ON "articles" USING btree ("published_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "articles"."status" = 'published';--> statement-breakpoint
CREATE INDEX "articles_author_updated_idx" ON "articles" USING btree ("author_id","updated_at" DESC NULLS LAST,"id" DESC NULLS LAST);
--> statement-breakpoint
-- Better Auth authorization runs on the trusted server, not through Supabase JWT roles.
-- Keep article tables inaccessible through the public Data API, even with default grants.
REVOKE ALL ON TABLE "articles", "article_contents", "tags", "article_tags" FROM PUBLIC;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "articles", "article_contents", "tags", "article_tags" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "articles", "article_contents", "tags", "article_tags" FROM authenticated;
  END IF;
END $$;
