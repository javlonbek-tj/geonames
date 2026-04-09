import { db } from '../db';
import { objectCategories, objectTypes } from '../schema';
import { eq } from 'drizzle-orm';

const TYPES = [
  "Aeroport",
  "Agat serdolik koni",
  "Agroma'dan xomashyosi",
  "Avtostansiya",
  "Avtovokzal",
  "Barit koni",
  "Bazalt koni",
  "Bentonitli gillar koni",
  "Bentonit loy koni",
  "Bentonit tuproq koni",
  "Bezaktoshlar koni",
  "Biryuza koni",
  "Burg'ilash eritmasi uchun gillar koni",
  "Chaqmoq toshlar koni",
  "Chig'anoqtoshli ohaktosh koni",
  "Chinni buyumlar ishlab chiqarish uchun xomashyo koni",
  "Dala o'quv bazasi",
  "Dala shpati xomashyosi koni",
  "Dala shpati xomashyosi va vollastonit koni",
  "Devorbop toshlar koni",
  "Diabaz-porfirit koni",
  "Do'lga qarshi kurash stansiyasi",
  "Dolomit koni",
  "Dolomitlashgan ohaktosh koni",
  "Dolomit ohaktosh koni",
  "Felzit koni",
  "Ferrosilitsiy ishlab chiqarish xomashyosi koni",
  "Flyuorit koni",
  "Flyusli ohaktosh koni",
  "Fosforitlar koni",
  "Fosforit ma'danlari",
  "Gabbro koni",
  "Gabbroli jinslar koni",
  "Ganch koni",
  "G'aramda ishqorlash qurilmasi uchun gillar koni",
  "Gaz va kondensat",
  "Gidrouzel",
  "Gil koni",
  "Gilli slaneslar koni",
  "Gips koni",
  "Gips va angidrit koni",
  "G'isht xomashyosi koni",
  "Glaukonit koni",
  "Grafit koni",
  "Granit koni",
  "Granodiorit koni",
  "Granodiorit va kremniyli slanes koni",
  "Granosiyenit-porfir koni",
  "Havza",
  "Hayvon va qushlar uchun mineral ozuqa xomashyo",
  "Ignimbrit kvars porfirit koni",
  "Kaliy tuzi koni",
  "Kamyob metallar koni",
  "Kanal",
  "Kaolin, alunit koni",
  "Kaolin koni",
  "Kaolins koni",
  "Kaxolong koni",
  "Keramika uchun gillar koni",
  "Keramzit koni",
  "Keramzit xomashyosi koni",
  "Ko'l tuzi koni",
  "Ko'mir koni",
  "Kompleks prognostik stansiya",
  "Ko'prik",
  "Kumush koni",
  "Kvarsit koni",
  "Kvars koni",
  "Kvars qumi koni",
  "Kvars qumlari koni",
  "Litiy koni",
  "Lyossimon jins koni",
  "Lyossimon jinslar koni",
  "Lyossimon qumoq jinslar koni",
  "Lyossimon suglinkalar koni",
  "Marganets",
  "Marmar koni",
  "Marmarlashgan ohaktosh koni",
  "Marmar oniks koni",
  "Marmar va granit koni",
  "Metamorfli slaneslar",
  "Metro bekati",
  "Mineral bo'yoqlar koni",
  "Mineral tola ishlab chiqarish uchun xomashyo",
  "Mineral tuzlar",
  "Mirabilit koni",
  "Mis koni",
  "Mis ruda koni",
  "Mis rudalari koni",
  "Nasos stansiyasi",
  "Neft, gaz va kondensat",
  "Neft koni",
  "Neft va tabiiy gaz koni",
  "Ohaktosh dolomit",
  "Ohaktosh koni",
  "Ohaktosh va dolomitlashgan ohaktosh koni",
  "Ohaktosh ywq",
  "Ohak uchun ohaktosh",
  "Oltin koni",
  "Osh tuzi koni",
  "O'tga chidamli kukun ishlab chiqarish uchun xomashyo",
  "O'tga chidamli xomashyo",
  "Oxra koni",
  "Oyna , chinni qum koni",
  "Pegmatit koni",
  "Polimetall rudalar koni",
  "Porfirit koni",
  "Port",
  "Pristan",
  "Qo'ng'ir ko'mir koni",
  "Qoplama qumlar koni",
  "Qo'rg'oshin va rux koni",
  "Quduq",
  "Qumli graviy materiali koni",
  "Qum-shag'al material koni",
  "Qurilish qumlari koni",
  "Qurilish toshlari koni",
  "Qurilish xomashyosi koni",
  "Qurilish ywq",
  "Quriq ariq",
  "Qutqaruv stansiyasi",
  "Rang-barang toshlar koni",
  "Razyezd",
  "Rodonit koni",
  "Salestin",
  "Sardoba",
  "Sel suv ombori",
  "Sement xomashyosi koni",
  "Serpentinit koni",
  "Seysmik stansiya",
  "Shisha xomashyosi koni",
  "Silikat buyumlar uchun qum koni",
  "Simob koni",
  "Slanes koni",
  "Slaneslar koni",
  "Slanes ohaktosh koni",
  "Stronsiy koni",
  "Suglinka koni",
  "Sulfat tuzi koni",
  "Suv ombori",
  "Tabiiy gaz koni",
  "Tabiiy pardozbop toshlar",
  "Talk toshi koni",
  "Temir koni",
  "Temir ruda koni",
  "Temir yo'l razyezdi",
  "Temir yo'l stansiyasi",
  "Temir yo'l vokzali",
  "Texnik tuz koni",
  "To'g'onlar qurish uchun xomashyo koni",
  "Toshko'mir koni",
  "Toshli qum shag'al aralashmasi koni",
  "To'xtash punkti",
  "Travertin ohaktosh koni",
  "Traxibazalt porfirit koni",
  "Tuproq gidroslyudist-montmorillonit koni",
  "Tuproq koni",
  "Tuproq polimineral koni",
  "Tuz koni",
  "Uglevodorodlar",
  "Uran koni",
  "Vermikulit koni",
  "Vismut koni",
  "Volfram koni",
  "Volfram rudalari koni",
  "Volfram ruda, vollastonit konlari",
  "Yonuvchi slanes koni",
];

async function seed() {
  console.log('Seeding transport & engineering objects...');

  let [category] = await db
    .select()
    .from(objectCategories)
    .where(eq(objectCategories.code, 'TIT'));

  if (!category) {
    [category] = await db
      .insert(objectCategories)
      .values({
        code: 'TIT',
        nameUz: 'Transport va muhandislik-texnika infratuzilmasi obyektlari',
      })
      .returning();
    console.log(`Kategoriya yaratildi: ${category.nameUz}`);
  } else {
    console.log(`Kategoriya mavjud: ${category.nameUz}`);
  }

  let created = 0;
  let skipped = 0;

  for (const nameUz of TYPES) {
    const existing = await db.query.objectTypes.findFirst({
      where: (t, { and, eq: eqFn }) =>
        and(eqFn(t.categoryId, category.id), eqFn(t.nameUz, nameUz)),
    });
    if (existing) { skipped++; }
    else {
      await db.insert(objectTypes).values({ nameUz, categoryId: category.id });
      created++;
    }
  }

  console.log(`Yaratildi: ${created} ta, o'tkazib yuborildi: ${skipped} ta`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
