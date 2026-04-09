import * as XLSX from 'xlsx';
import { db } from './src/db/db';
import { objectTypes, geographicObjects, users } from './src/db/schema';

function norm(s: string): string {
  return s.replace(/[\u2018\u2019\u02BB\u02BC\u0060]/g, "'").trim();
}

async function test() {
  const wb = XLSX.readFile('./Andijon.xlsx');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null }) as any[];

  const allTypes = await db.select({ id: objectTypes.id, nameUz: objectTypes.nameUz }).from(objectTypes);
  const typeMap = new Map<string, number>(allTypes.map((t) => [norm(t.nameUz), t.id]));

  const [adminUser] = await db.select({ id: users.id }).from(users).limit(1);

  const row = rows[0];
  console.log('Inserting row:', JSON.stringify(row));

  // Check nameUz length
  const longNames = rows.filter((r) => (r.nameUz ?? '').length > 200);
  console.log(`nameUz > 200 chars: ${longNames.length} ta`);
  if (longNames.length > 0) {
    console.log('Sample:', longNames[0].nameUz?.length, longNames[0].nameUz);
  }

  const longKrill = rows.filter((r) => (r.nameKrill ?? '').length > 200);
  console.log(`nameKrill > 200 chars: ${longKrill.length} ta`);

  try {
    await db.insert(geographicObjects).values({
      registryNumber: row.registryNumber ? String(row.registryNumber) : null,
      nameUz: row.nameUz ?? '',
      nameKrill: row.nameKrill ?? null,
      basisDocument: row.basisDocument ?? null,
      objectTypeId: row.objectTypeId ? typeMap.get(norm(row.objectTypeId))! : null,
      affiliation: row.affiliation ?? null,
      regionId: row.regionId ?? null,
      districtId: row.districtId ?? null,
      comment: row.comment ?? null,
      historicalName: row.historicalName ?? null,
      existsInRegistry: true,
      createdBy: adminUser.id,
    });
    console.log('✅ Insert OK');
  } catch (e: any) {
    console.error('❌ Error:', e?.message);
    console.error('Cause:', e?.cause?.message ?? e?.cause);
  }
  process.exit(0);
}

test().catch(console.error);
