CREATE TABLE "content_grammar_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" text NOT NULL,
	"level" text NOT NULL,
	"position" integer NOT NULL,
	"pattern" text NOT NULL,
	"meaning" text,
	"explanation" text,
	"examples" jsonb,
	"draft" boolean DEFAULT true NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_vocab" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" text NOT NULL,
	"term" text NOT NULL,
	"reading" text,
	"meaning" text,
	"pos" text,
	"level" text NOT NULL,
	"frequency_rank" integer,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "study_packs" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "study_packs" ADD COLUMN "level" text;--> statement-breakpoint
ALTER TABLE "study_packs" ADD COLUMN "unit" integer;--> statement-breakpoint
ALTER TABLE "study_paths" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "study_paths" ADD COLUMN "level" text;--> statement-breakpoint
CREATE UNIQUE INDEX "content_grammar_lang_pattern_idx" ON "content_grammar_points" USING btree ("language","pattern");--> statement-breakpoint
CREATE INDEX "content_grammar_language_level_idx" ON "content_grammar_points" USING btree ("language","level");--> statement-breakpoint
CREATE UNIQUE INDEX "content_vocab_lang_term_reading_idx" ON "content_vocab" USING btree ("language","term",coalesce("reading", ''));--> statement-breakpoint
CREATE INDEX "content_vocab_language_level_idx" ON "content_vocab" USING btree ("language","level");--> statement-breakpoint
CREATE INDEX "study_packs_language_level_idx" ON "study_packs" USING btree ("language","level");