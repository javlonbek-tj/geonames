import { db } from './db';
import { sql } from 'drizzle-orm';

async function migrate() {
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS basis_document text`);
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS affiliation varchar(200)`);
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS historical_name varchar(200)`);
  await db.execute(sql`ALTER TABLE geographic_objects ADD COLUMN IF NOT EXISTS comment text`);
  await db.execute(sql`ALTER TABLE geographic_objects ALTER COLUMN application_id DROP NOT NULL`);
  console.log('Migration complete');
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
