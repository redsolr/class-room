ALTER TABLE "teachers" ADD COLUMN "teaching_since" timestamp with time zone;--> statement-breakpoint
-- Teaching becomes OPT-IN (2026-09-12). Until now every unknown login was
-- made a teacher; the role is `teaching_since`, not the row. Backfill it
-- for every row that has actually taught — a roster, a lesson, or a tutor
-- listing — so real teachers keep their desk and accidental rows become
-- what they always were: learners.
UPDATE "teachers" t SET "teaching_since" = t."created_at"
WHERE t."teaching_since" IS NULL AND (
  EXISTS (SELECT 1 FROM "students" s WHERE s."teacher_id" = t."id")
  OR EXISTS (SELECT 1 FROM "lessons" l WHERE l."teacher_id" = t."id")
  OR EXISTS (SELECT 1 FROM "tutor_profiles" p WHERE p."teacher_id" = t."id")
);
