import * as XLSX from 'xlsx';
import { db } from '../db';
import { objectTypes, geographicObjects, users } from '../schema';

// Normalize apostrophe variants to standard ASCII apostrophe (U+0027)
// Handles: U+2018 ' U+2019 ' U+02BB ʻ U+02BC ʼ U+0060 `
function norm(s: string): string {
  return s.replace(/[\u2018\u2019\u02BB\u02BC\u0060]/g, "'").trim();
}

async function seed() {
  console.log('Seeding Andijon registry...');

  // 1. Load Excel data
  const wb = XLSX.readFile('./Andijon.xlsx');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null }) as Array<{
    registryNumber: number | null;
    nameKrill: string | null;
    nameUz: string | null;
    basisDocument: string | null;
    objectTypeId: string | null;
    affiliation: string | null;
    regionId: number | null;
    districtId: number | null;
    comment: string | null;
    historicalName: string | null;
  }>;
  console.log(`Excel: ${rows.length} ta qator`);

  // 2. Load all object types from DB → normalized name→id map
  const allTypes = await db.select({ id: objectTypes.id, nameUz: objectTypes.nameUz }).from(objectTypes);
  const typeMap = new Map<string, number>(allTypes.map((t) => [norm(t.nameUz), t.id]));

  // 3. Find unmatched type names
  const uniqueTypeNames = [...new Set(rows.map((r) => r.objectTypeId).filter(Boolean))] as string[];
  const unmatched = uniqueTypeNames.filter((name) => !typeMap.has(norm(name)));
  if (unmatched.length > 0) {
    console.warn('⚠️  Databazada topilmagan turlar:', unmatched);
  } else {
    console.log('✅ Barcha turlar databazada mavjud');
  }

  // 4. Find admin/system user for createdBy
  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .limit(1);
  if (!adminUser) throw new Error('Databazada hech qanday foydalanuvchi topilmadi');
  console.log(`createdBy = ${adminUser.id} (birinchi foydalanuvchi)`);

  // 5. Check already seeded (by registryNumber)
  const existingNumbers = new Set(
    (await db.select({ rn: geographicObjects.registryNumber }).from(geographicObjects))
      .map((r) => r.rn)
      .filter(Boolean),
  );
  console.log(`Allaqachon bazada: ${existingNumbers.size} ta reyestr raqam`);

  // 6. Build insert values
  const toInsert = rows
    .filter((row) => {
      // Skip if type is unknown
      if (row.objectTypeId && !typeMap.has(norm(row.objectTypeId))) return false;
      // Skip if already exists
      if (row.registryNumber && existingNumbers.has(String(row.registryNumber))) return false;
      return true;
    })
    .map((row) => ({
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
    }));

  console.log(`Kiritiladi: ${toInsert.length} ta qator`);

  // 7. Insert in batches of 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    await db.insert(geographicObjects).values(batch);
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted}/${toInsert.length} kiritildi...`);
  }
  console.log(`\n✅ Jami ${inserted} ta obyekt kiritildi`);
  process.exit(0);
}

seed().catch((e) => {
  console.error('Error:', e?.message ?? e);
  if (e?.cause) console.error('Cause:', e.cause);
  process.exit(1);
});
