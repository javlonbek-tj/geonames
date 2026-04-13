import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { db } from '../db';
import { objectTypes, geographicObjects, users, regions, districts } from '../schema';
import { sql } from 'drizzle-orm';

// Normalize apostrophe variants to standard ASCII apostrophe (U+0027)
function norm(s: string): string {
  return s.replace(/[\u2018\u2019\u02BB\u02BC\u0060]/g, "'").trim();
}

type SkipReason = 'unknown_type' | 'invalid_region' | 'invalid_district' | 'db_error';

interface SkippedRow {
  excelRow: number;
  registryNumber: string | null;
  nameUz: string | null;
  reason: SkipReason;
  detail: string;
}

async function seed() {
  console.log('Seeding Andijon registry...');

  // 1. Load Excel data
  const wb = XLSX.readFile('./Andijon.xlsx');
  const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    defval: null,
  }) as Array<{
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
  console.log(`Excel: ${rawRows.length} ta qator`);

  // 2. Load object types
  const allTypes = await db.select({ id: objectTypes.id, nameUz: objectTypes.nameUz }).from(objectTypes);
  const typeMap = new Map<string, number>(allTypes.map((t) => [norm(t.nameUz), t.id]));

  // 3. Load valid region/district IDs
  const allRegions = await db.select({ id: regions.id, nameUz: regions.nameUz }).from(regions);
  const validRegionIds = new Set<number>(allRegions.map((r) => r.id));
  const allDistricts = await db.select({ id: districts.id, nameUz: districts.nameUz }).from(districts);
  const validDistrictIds = new Set<number>(allDistricts.map((d) => d.id));
  console.log(`Valid regions: ${validRegionIds.size}, valid districts: ${validDistrictIds.size}`);

  // 4. Find admin user
  const [adminUser] = await db.select({ id: users.id }).from(users).limit(1);
  if (!adminUser) throw new Error('Databazada hech qanday foydalanuvchi topilmadi');
  console.log(`createdBy = ${adminUser.id}`);

  // 5. Report unmatched type names
  const uniqueTypeNames = [...new Set(rawRows.map((r) => r.objectTypeId).filter(Boolean))] as string[];
  const unmatchedTypes = uniqueTypeNames.filter((name) => !typeMap.has(norm(name)));
  if (unmatchedTypes.length > 0) {
    console.warn(`⚠️  Databazada topilmagan ${unmatchedTypes.length} ta tur:`, unmatchedTypes);
  } else {
    console.log('✅ Barcha turlar databazada mavjud');
  }

  // 6. Truncate and reset sequence
  console.log('Tablo tozalanmoqda...');
  await db.execute(sql`TRUNCATE geographic_objects RESTART IDENTITY CASCADE`);
  console.log('✅ geographic_objects tozalandi, ID 1 dan boshlanadi');

  // 7. Filter rows and collect skipped
  const skipped: SkippedRow[] = [];
  const toInsert: Array<{ _excelRow: number; data: Record<string, unknown> }> = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const excelRow = i + 2; // Excel 1-indexed, row 1 is header

    if (row.objectTypeId && !typeMap.has(norm(row.objectTypeId))) {
      skipped.push({
        excelRow,
        registryNumber: row.registryNumber ? String(row.registryNumber) : null,
        nameUz: row.nameUz,
        reason: 'unknown_type',
        detail: `objectTypeId: "${row.objectTypeId}"`,
      });
      continue;
    }

    if (row.regionId && !validRegionIds.has(row.regionId)) {
      skipped.push({
        excelRow,
        registryNumber: row.registryNumber ? String(row.registryNumber) : null,
        nameUz: row.nameUz,
        reason: 'invalid_region',
        detail: `regionId: ${row.regionId}`,
      });
      continue;
    }

    if (row.districtId && !validDistrictIds.has(row.districtId)) {
      skipped.push({
        excelRow,
        registryNumber: row.registryNumber ? String(row.registryNumber) : null,
        nameUz: row.nameUz,
        reason: 'invalid_district',
        detail: `districtId: ${row.districtId}`,
      });
      continue;
    }

    toInsert.push({
      _excelRow: excelRow,
      data: {
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
      },
    });
  }

  console.log(`Kiritiladi: ${toInsert.length} ta | Filtrlandi: ${skipped.length} ta`);

  // 8. Insert in batches, fallback to row-by-row on error
  const BATCH = 200;
  let inserted = 0;
  let dbErrorCount = 0;

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    try {
      await db
        .insert(geographicObjects)
        .values(batch.map((b) => b.data) as Parameters<typeof db.insert>[0] extends infer T ? any : any)
        .onConflictDoNothing();
      inserted += batch.length;
    } catch {
      // Batch failed → try one by one
      for (const item of batch) {
        try {
          await db.insert(geographicObjects).values([item.data as any]).onConflictDoNothing();
          inserted++;
        } catch (rowErr: any) {
          dbErrorCount++;
          skipped.push({
            excelRow: item._excelRow,
            registryNumber: (item.data.registryNumber as string) ?? null,
            nameUz: (item.data.nameUz as string) ?? null,
            reason: 'db_error',
            detail: rowErr?.message?.slice(0, 200) ?? 'Unknown DB error',
          });
        }
      }
    }
    process.stdout.write(`\r  ${inserted}/${toInsert.length} kiritildi (${dbErrorCount} db xato)...`);
  }

  console.log(`\n✅ Jami ${inserted} ta obyekt kiritildi`);

  // 9. Write skipped report
  const reportPath = './seed-skipped-report.json';
  const summary = {
    totalExcelRows: rawRows.length,
    inserted,
    totalSkipped: skipped.length,
    byReason: {
      unknown_type: skipped.filter((s) => s.reason === 'unknown_type').length,
      invalid_region: skipped.filter((s) => s.reason === 'invalid_region').length,
      invalid_district: skipped.filter((s) => s.reason === 'invalid_district').length,
      db_error: skipped.filter((s) => s.reason === 'db_error').length,
    },
    rows: skipped,
  };
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\n📋 Hisobot: ${reportPath}`);
  console.log(`   unknown_type:    ${summary.byReason.unknown_type}`);
  console.log(`   invalid_region:  ${summary.byReason.invalid_region}`);
  console.log(`   invalid_district:${summary.byReason.invalid_district}`);
  console.log(`   db_error:        ${summary.byReason.db_error}`);

  process.exit(0);
}

seed().catch((e) => {
  console.error('Error:', e?.message ?? e);
  if (e?.cause) console.error('Cause:', e.cause);
  process.exit(1);
});
