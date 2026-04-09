import { db } from '../db';
import { objectCategories, objectTypes } from '../schema';
import { eq } from 'drizzle-orm';

const APU_TYPES = [
  'Aholi punkti',
  "Aylanma ko'cha",
  "Berk ko'cha",
  "Bog'",
  'Daha',
  "Hayvonot bog'i",
  "Istirohat bog'i",
  "Ko'cha",
  'Mahalla',
  'Massiv',
  'Mavze',
  'Maydon',
  "Muyulishli ko'cha",
  "O'rta ko'cha",
  "O'tish yo'li",
  'Qabr',
  'Qabriston',
  "Qo'rg'on",
  "Shoh ko'cha",
  "Tor ko'cha",
  'Xiyobon',
  "Yo'lak ko'cha",
  'Ziyoratgoh',
];

async function seed() {
  console.log('Seeding object types...');

  // 1. Kategoriyani yaratamiz yoki mavjudini olamiz
  let [category] = await db
    .select()
    .from(objectCategories)
    .where(eq(objectCategories.code, 'APU'));

  if (!category) {
    [category] = await db
      .insert(objectCategories)
      .values({
        code: 'APU',
        nameUz: "Aholi punktlari va ularning tarkibiy qismlari",
      })
      .returning();
    console.log(`Kategoriya yaratildi: ${category.nameUz} (${category.code})`);
  } else {
    console.log(`Kategoriya mavjud: ${category.nameUz} (${category.code})`);
  }

  // 2. Har bir turni kiritamiz (mavjud bo'lsa o'tkazib yuboramiz)
  let created = 0;
  let skipped = 0;

  for (const nameUz of APU_TYPES) {
    const existing = await db.query.objectTypes.findFirst({
      where: (t, { and, eq: eqFn }) =>
        and(eqFn(t.categoryId, category.id), eqFn(t.nameUz, nameUz)),
    });

    if (existing) {
      skipped++;
    } else {
      await db.insert(objectTypes).values({ nameUz, categoryId: category.id });
      created++;
    }
  }

  console.log(`Yaratildi: ${created} ta, o'tkazib yuborildi: ${skipped} ta`);
  console.log('Done.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
