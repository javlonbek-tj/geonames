import { db } from './db';
import { sql } from 'drizzle-orm';

async function migrate() {
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS basis_document text`);
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS affiliation varchar(200)`);
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS historical_name varchar(200)`);
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS comment text`);
  await db.execute(sql`ALTER TABLE geographic_objects ALTER COLUMN application_id DROP NOT NULL`);
  await db.execute(sql`ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'attachment'`);

  // Commission positions
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE commission_position AS ENUM (
        'hokim','hokim_deputy','economics_head','construction_head',
        'poverty_head','ecology_head','culture_head','spirituality_head',
        'newspaper_head','dkp_head','historian','linguist','geographer'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);

  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS position commission_position`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS commission_approvals (
      id serial PRIMARY KEY,
      application_id integer NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      user_id integer NOT NULL REFERENCES users(id),
      position commission_position NOT NULL,
      approved boolean NOT NULL DEFAULT true,
      comment text,
      created_at timestamp DEFAULT now() NOT NULL,
      CONSTRAINT uq_commission_approval UNIQUE (application_id, position)
    )
  `);
  // Agar jadval allaqachon mavjud bo'lsa ustunlarni qo'shamiz
  await db.execute(sql`ALTER TABLE commission_approvals ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`);
  await db.execute(sql`ALTER TABLE commission_approvals ADD COLUMN IF NOT EXISTS comment text`);

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
