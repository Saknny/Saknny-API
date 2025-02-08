import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupFullTextSearchForJobsAndStudents1736208787973
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`
        -- Ensure the pg_trgm extension is available
        CREATE EXTENSION IF NOT EXISTS pg_trgm;

        -- Add the "jobSearchVector" column to the "job" table
        ALTER TABLE "job"
        ADD COLUMN IF NOT EXISTS "jobSearchVector" tsvector;

        -- Add the "studentSearchVector" column to the "student" table
        ALTER TABLE "student"
        ADD COLUMN IF NOT EXISTS "studentSearchVector" tsvector;

        -- Backfill the "jobSearchVector" column
        UPDATE "job"
        SET "jobSearchVector" = 
          setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("description", '')), 'B') ||
          setweight(
            to_tsvector('english', 
              coalesce(
                (SELECT string_agg("title", ' ') 
                 FROM tag 
                 INNER JOIN tag_jobs_job ON tag_jobs_job."tagId" = tag.id
                 WHERE tag_jobs_job."jobId" = job.id
                ), 
                ''
              )
            ), 
            'A'
          );

        -- Backfill the "studentSearchVector" column
        UPDATE "student"
        SET "studentSearchVector" = 
          setweight(to_tsvector('english', coalesce("firstName", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("lastName", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("bio", '')), 'B');

        -- Create a GIN index for the "jobSearchVector" column
        CREATE INDEX IF NOT EXISTS job_search_vector_idx
        ON "job"
        USING GIN ("jobSearchVector");

        -- Create a GIN index for the "studentSearchVector" column
        CREATE INDEX IF NOT EXISTS student_search_vector_idx
        ON "student"
        USING GIN ("studentSearchVector");

        -- Create the job_unique_words view including tags
        CREATE VIEW job_unique_words AS
        SELECT DISTINCT word
        FROM (
            -- Get words from job title and description
            SELECT unnest(string_to_array(lower(job."title"), ' ')) AS word 
            FROM public.job
            UNION
            SELECT unnest(string_to_array(lower(job."description"), ' ')) AS word 
            FROM public.job
            UNION
            -- Get words from job's associated tags
            SELECT unnest(string_to_array(lower(tag."title"), ' ')) AS word 
            FROM public.job
            INNER JOIN tag_jobs_job ON tag_jobs_job."jobId" = job.id
            INNER JOIN tag ON tag.id = tag_jobs_job."tagId"
        ) AS combined_words;

        -- Create the student_unique_words view for students
        CREATE VIEW student_unique_words AS
        SELECT DISTINCT word
        FROM (
            -- Get words from student first and last name
            SELECT unnest(string_to_array(lower(student."firstName"), ' ')) AS word 
            FROM public.student
            UNION
            SELECT unnest(string_to_array(lower(student."lastName"), ' ')) AS word 
            FROM public.student
            UNION
            -- Get words from student bio
            SELECT unnest(string_to_array(lower(student."bio"), ' ')) AS word
            FROM public.student
        ) AS combined_words;

        -- Drop and recreate the trigger function for jobs
        DROP FUNCTION IF EXISTS job_tsvector_trigger;
        CREATE FUNCTION job_tsvector_trigger() RETURNS trigger AS $$
        BEGIN
          NEW."jobSearchVector" := 
            setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW."description", '')), 'B') ||
            setweight(
              to_tsvector('english', 
                coalesce(
                  (SELECT string_agg("title", ' ') 
                   FROM tag 
                   INNER JOIN tag_jobs_job ON tag_jobs_job."tagId" = tag.id
                   WHERE tag_jobs_job."jobId" = NEW.id
                  ), 
                  ''
                )
              ), 
              'A'
            );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Attach the trigger to the "job" table
        DROP TRIGGER IF EXISTS tsvectorupdate_job ON "job";
        CREATE TRIGGER tsvectorupdate_job
        BEFORE INSERT OR UPDATE ON "job"
        FOR EACH ROW EXECUTE FUNCTION job_tsvector_trigger();

        -- Drop and recreate the trigger function for students
        DROP FUNCTION IF EXISTS student_tsvector_trigger;
        CREATE FUNCTION student_tsvector_trigger() RETURNS trigger AS $$
        BEGIN
          NEW."studentSearchVector" := 
            setweight(to_tsvector('english', coalesce(NEW."firstName", '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW."lastName", '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW."bio", '')), 'B');
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Attach the trigger to the "student" table
        DROP TRIGGER IF EXISTS tsvectorupdate_student ON "student";
        CREATE TRIGGER tsvectorupdate_student
        BEFORE INSERT OR UPDATE ON "student"
        FOR EACH ROW EXECUTE FUNCTION student_tsvector_trigger();
      `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`
        -- Drop the triggers first to remove dependencies on their associated functions
        DROP TRIGGER IF EXISTS tsvectorupdate_job ON "job";
        DROP TRIGGER IF EXISTS tsvectorupdate_student ON "student";
  
        -- Now drop the associated trigger functions
        DROP FUNCTION IF EXISTS job_tsvector_trigger;
        DROP FUNCTION IF EXISTS student_tsvector_trigger;
  
        -- Drop the GIN indexes
        DROP INDEX IF EXISTS job_search_vector_idx;
        DROP INDEX IF EXISTS student_search_vector_idx;
  
        -- Drop the "job_unique_words" and "student_unique_words" views
        DROP VIEW IF EXISTS job_unique_words;
        DROP VIEW IF EXISTS student_unique_words;

        -- Drop the columns
        ALTER TABLE "job" DROP COLUMN IF EXISTS "jobSearchVector";
        ALTER TABLE "student" DROP COLUMN IF EXISTS "studentSearchVector";
  
        -- Remove the pg_trgm extension
        DROP EXTENSION IF EXISTS pg_trgm;
      `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}

// DROP FUNCTION student_tsvector_trigger() CASCADE;
// DROP FUNCTION job_tsvector_trigger() CASCADE;
// DROP VIEW IF EXISTS job_unique_words;
// DROP VIEW IF EXISTS student_unique_words;
