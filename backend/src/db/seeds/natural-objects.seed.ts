import { db } from '../db';
import { objectCategories, objectTypes } from '../schema';
import { eq } from 'drizzle-orm';

const TYPES = [
  'Adirlar',
  'Ariq',
  'Barxan',
  'Biosfera rezervati',
  'Botiq',
  'Botqoqlik',
  'Buloq',
  "Buyurtma qo'riqxona",
  'Chink',
  "Cho'l",
  "Cho'qqi",
  'Dara',
  'Daraxtzor',
  'Daryo',
  'Dasht',
  'Davlat biosfera qo\'riqxonasi',
  'Davlat qo\'riqxonasi',
  "Do'nglik",
  'Dovon',
  "G'or",
  'Havza',
  'Hovuz',
  'Irmoq',
  'Jar',
  'Jarlik',
  "Ko'chki",
  "Ko'l",
  "Ko'llar",
  'Kollektor',
  "Ko'tarilish",
  'Marza',
  "Milliy tabiat bog'i",
  'Muzlik',
  "O'pko'n",
  "O'rmon",
  'Orol',
  'Orollar',
  'Pitomnik',
  'Plato',
  'Qator',
  'Qir',
  'Qirlik',
  'Qiyalik',
  "Qo'rg'ontepa",
  "Qo'riqxona",
  'Qoya',
  'Qumliklar',
  'Qurigan dengiz tubi',
  "Quruq o'zan",
  'Sel tashlamasi',
  'Sharshara',
  "Sho'rxok",
  'Soy',
  'Soylik',
  'Suv tashlamasi',
  "Tabiat bog'i",
  'Tabiat yodgorligi',
  'Tangi',
  'Taqir',
  'Taqirlik',
  'Tekislik',
  'Tepalik',
  "Tog'",
  "Tog' tizmasi",
  'Urochishe',
  'Uval',
  'Uyum',
  'Vichta kanal',
  'Vodiy',
  'Yarimorol',
  'Yer osti suvlari',
  "Yuvilma yo'lka",
];

async function seed() {
  console.log('Seeding natural object types...');

  let [category] = await db
    .select()
    .from(objectCategories)
    .where(eq(objectCategories.code, 'TAB'));

  if (!category) {
    [category] = await db
      .insert(objectCategories)
      .values({ code: 'TAB', nameUz: 'Tabiiy obyektlar' })
      .returning();
    console.log(`Kategoriya yaratildi: ${category.nameUz} (${category.code})`);
  } else {
    console.log(`Kategoriya mavjud: ${category.nameUz} (${category.code})`);
  }

  let created = 0;
  let skipped = 0;

  for (const nameUz of TYPES) {
    const existing = await db.query.objectTypes.findFirst({
      where: (t, { and, eq: eqFn }) =>
        and(eqFn(t.categoryId, category.id), eqFn(t.nameUz, nameUz)),
    });
    if (existing) { skipped++; }
    else { await db.insert(objectTypes).values({ nameUz, categoryId: category.id }); created++; }
  }

  console.log(`Yaratildi: ${created} ta, o'tkazib yuborildi: ${skipped} ta`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
