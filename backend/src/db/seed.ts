import { db } from './db';
import { regions, districts, users } from './schema';
import bcrypt from 'bcryptjs';

// ─── Viloyatlar ───────────────────────────────────────────────────────────────

const regionsData = [
  { code: '1703', nameUz: 'Andijon viloyati' },
  { code: '1706', nameUz: 'Buxoro viloyati' },
  { code: '1730', nameUz: "Farg'ona viloyati" },
  { code: '1708', nameUz: 'Jizzax viloyati' },
  { code: '1714', nameUz: 'Namangan viloyati' },
  { code: '1712', nameUz: 'Navoiy viloyati' },
  { code: '1710', nameUz: 'Qashqadaryo viloyati' },
  { code: '1735', nameUz: "Qoraqalpog'iston Respublikasi" },
  { code: '1718', nameUz: 'Samarqand viloyati' },
  { code: '1724', nameUz: 'Sirdaryo viloyati' },
  { code: '1722', nameUz: 'Surxondaryo viloyati' },
  { code: '1726', nameUz: 'Toshkent shahar' },
  { code: '1727', nameUz: 'Toshkent viloyati' },
  { code: '1733', nameUz: 'Xorazm viloyati' },
];

// ─── Tumanlar ─────────────────────────────────────────────────────────────────

const districtsData = [
  // Andijon viloyati (1703)
  { regionCode: '1703', code: '1703401', nameUz: 'Andijon shahri' },
  { regionCode: '1703', code: '1703203', nameUz: 'Andijon tumani' },
  { regionCode: '1703', code: '1703224', nameUz: 'Asaka tumani' },
  { regionCode: '1703', code: '1703206', nameUz: 'Baliqchi tumani' },
  { regionCode: '1703', code: '1703209', nameUz: "Bo'ston tumani" },
  { regionCode: '1703', code: '1703210', nameUz: 'Buloqboshi tumani' },
  { regionCode: '1703', code: '1703214', nameUz: 'Izboskan tumani' },
  { regionCode: '1703', code: '1703211', nameUz: 'Jalaquduq tumani' },
  { regionCode: '1703', code: '1703227', nameUz: 'Marhamat tumani' },
  { regionCode: '1703', code: '1703202', nameUz: "Oltinko'l tumani" },
  { regionCode: '1703', code: '1703232', nameUz: 'Paxtaobod tumani' },
  { regionCode: '1703', code: '1703220', nameUz: "Qo'rg'ontepa tumani" },
  { regionCode: '1703', code: '1703230', nameUz: 'Shahrixon tumani' },
  { regionCode: '1703', code: '1703217', nameUz: "Ulug'nor tumani" },
  { regionCode: '1703', code: '1703236', nameUz: "Xo'jaobod tumani" },
  { regionCode: '1703', code: '1703408', nameUz: 'Xonobod shahri' },
  // Buxoro viloyati (1706)
  { regionCode: '1706', code: '1706401', nameUz: 'Buxoro shahri' },
  { regionCode: '1706', code: '1706207', nameUz: 'Buxoro tumani' },
  { regionCode: '1706', code: '1706215', nameUz: "G'ijduvon tumani" },
  { regionCode: '1706', code: '1706246', nameUz: 'Jondor tumani' },
  { regionCode: '1706', code: '1706403', nameUz: 'Kogon shahri' },
  { regionCode: '1706', code: '1706219', nameUz: 'Kogon tumani' },
  { regionCode: '1706', code: '1706204', nameUz: 'Olot tumani' },
  { regionCode: '1706', code: '1706240', nameUz: 'Peshku tumani' },
  { regionCode: '1706', code: '1706230', nameUz: "Qorako'l tumani" },
  { regionCode: '1706', code: '1706232', nameUz: 'Qorovulbozor tumani' },
  { regionCode: '1706', code: '1706242', nameUz: 'Romitan tumani' },
  { regionCode: '1706', code: '1706258', nameUz: 'Shofirkon tumani' },
  { regionCode: '1706', code: '1706212', nameUz: 'Vobkent tumani' },
  // Farg'ona viloyati (1730)
  { regionCode: '1730', code: '1730209', nameUz: "Bag'dod tumani" },
  { regionCode: '1730', code: '1730215', nameUz: 'Beshariq tumani' },
  { regionCode: '1730', code: '1730212', nameUz: 'Buvayda tumani' },
  { regionCode: '1730', code: '1730236', nameUz: "Dang'ara tumani" },
  { regionCode: '1730', code: '1730401', nameUz: "Farg'ona shahri" },
  { regionCode: '1730', code: '1730233', nameUz: "Farg'ona tumani" },
  { regionCode: '1730', code: '1730238', nameUz: 'Furqat tumani' },
  { regionCode: '1730', code: '1730412', nameUz: "Marg'ilon shahri" },
  { regionCode: '1730', code: '1730203', nameUz: 'Oltiariq tumani' },
  { regionCode: '1730', code: '1730230', nameUz: "O'zbekiston tumani" },
  { regionCode: '1730', code: '1730405', nameUz: "Qo'qon shahri" },
  { regionCode: '1730', code: '1730206', nameUz: "Qo'shtepa tumani" },
  { regionCode: '1730', code: '1730218', nameUz: 'Quva tumani' },
  { regionCode: '1730', code: '1730408', nameUz: 'Quvasoy shahri' },
  { regionCode: '1730', code: '1730224', nameUz: 'Rishton tumani' },
  { regionCode: '1730', code: '1730226', nameUz: "So'x tumani" },
  { regionCode: '1730', code: '1730227', nameUz: 'Toshloq tumani' },
  { regionCode: '1730', code: '1730221', nameUz: "Uchko'prik tumani" },
  { regionCode: '1730', code: '1730242', nameUz: 'Yozyovon tumani' },
  // Jizzax viloyati (1708)
  { regionCode: '1708', code: '1708201', nameUz: 'Arnasoy tumani' },
  { regionCode: '1708', code: '1708204', nameUz: 'Baxmal tumani' },
  { regionCode: '1708', code: '1708215', nameUz: "Do'stlik tumani" },
  { regionCode: '1708', code: '1708235', nameUz: 'Forish tumani' },
  { regionCode: '1708', code: '1708209', nameUz: "G'allaorol tumani" },
  { regionCode: '1708', code: '1708401', nameUz: 'Jizzax shahri' },
  { regionCode: '1708', code: '1708223', nameUz: "Mirzacho'l tumani" },
  { regionCode: '1708', code: '1708228', nameUz: 'Paxtakor tumani' },
  { regionCode: '1708', code: '1708212', nameUz: 'Sharof Rashidov tumani' },
  { regionCode: '1708', code: '1708237', nameUz: 'Yangiobod tumani' },
  { regionCode: '1708', code: '1708225', nameUz: 'Zafarobod tumani' },
  { regionCode: '1708', code: '1708220', nameUz: 'Zarbdor tumani' },
  { regionCode: '1708', code: '1708218', nameUz: 'Zomin tumani' },
  // Namangan viloyati (1714)
  { regionCode: '1714', code: '1714236', nameUz: 'Chortoq tumani' },
  { regionCode: '1714', code: '1714237', nameUz: 'Chust tumani' },
  { regionCode: '1714', code: '1714207', nameUz: 'Kosonsoy tumani' },
  { regionCode: '1714', code: '1714204', nameUz: 'Mingbuloq tumani' },
  { regionCode: '1714', code: '1714401', nameUz: 'Namangan shahri' },
  { regionCode: '1714', code: '1714212', nameUz: 'Namangan tumani' },
  { regionCode: '1714', code: '1714216', nameUz: 'Norin tumani' },
  { regionCode: '1714', code: '1714219', nameUz: 'Pop tumani' },
  { regionCode: '1714', code: '1714224', nameUz: "To'raqo'rg'on tumani" },
  { regionCode: '1714', code: '1714234', nameUz: "Uchqo'rg'on tumani" },
  { regionCode: '1714', code: '1714229', nameUz: 'Uychi tumani' },
  { regionCode: '1714', code: '1714242', nameUz: "Yangiqo'rg'on tumani" },
  // Navoiy viloyati (1712)
  { regionCode: '1712', code: '1712412', nameUz: "G'ozg'on shahri" },
  { regionCode: '1712', code: '1712234', nameUz: 'Karmana tumani' },
  { regionCode: '1712', code: '1712211', nameUz: 'Konimex tumani' },
  { regionCode: '1712', code: '1712230', nameUz: 'Navbahor tumani' },
  { regionCode: '1712', code: '1712401', nameUz: 'Navoiy shahri' },
  { regionCode: '1712', code: '1712238', nameUz: 'Nurota tumani' },
  { regionCode: '1712', code: '1712216', nameUz: 'Qiziltepa tumani' },
  { regionCode: '1712', code: '1712244', nameUz: 'Tomdi tumani' },
  { regionCode: '1712', code: '1712248', nameUz: 'Uchquduq tumani' },
  { regionCode: '1712', code: '1712251', nameUz: 'Xatirchi tumani' },
  { regionCode: '1712', code: '1712408', nameUz: 'Zarafshon shahri' },
  // Qashqadaryo viloyati (1710)
  { regionCode: '1710', code: '1710242', nameUz: 'Chiroqchi tumani' },
  { regionCode: '1710', code: '1710212', nameUz: 'Dehqonobod tumani' },
  { regionCode: '1710', code: '1710207', nameUz: "G'uzor tumani" },
  { regionCode: '1710', code: '1710237', nameUz: 'Kasbi tumani' },
  { regionCode: '1710', code: '1710232', nameUz: 'Kitob tumani' },
  { regionCode: '1710', code: '1710240', nameUz: "Ko'kdala tumani" },
  { regionCode: '1710', code: '1710229', nameUz: 'Koson tumani' },
  { regionCode: '1710', code: '1710233', nameUz: 'Mirishkor tumani' },
  { regionCode: '1710', code: '1710234', nameUz: 'Muborak tumani' },
  { regionCode: '1710', code: '1710235', nameUz: 'Nishon tumani' },
  { regionCode: '1710', code: '1710220', nameUz: 'Qamashi tumani' },
  { regionCode: '1710', code: '1710401', nameUz: 'Qarshi shahri' },
  { regionCode: '1710', code: '1710224', nameUz: 'Qarshi tumani' },
  { regionCode: '1710', code: '1710405', nameUz: 'Shahrisabz shahri' },
  { regionCode: '1710', code: '1710245', nameUz: 'Shahrisabz tumani' },
  { regionCode: '1710', code: '1710250', nameUz: "Yakkabog' tumani" },
  // Qoraqalpog'iston Respublikasi (1735)
  { regionCode: '1735', code: '1735204', nameUz: 'Amudaryo tumani' },
  { regionCode: '1735', code: '1735207', nameUz: 'Beruniy tumani' },
  { regionCode: '1735', code: '1735209', nameUz: "Bo'zatov tumani" },
  { regionCode: '1735', code: '1735240', nameUz: 'Chimboy tumani' },
  { regionCode: '1735', code: '1735250', nameUz: "Ellikqal'a tumani" },
  { regionCode: '1735', code: '1735212', nameUz: 'Kegeyli tumani' },
  { regionCode: '1735', code: '1735222', nameUz: "Mo'ynoq tumani" },
  { regionCode: '1735', code: '1735401', nameUz: 'Nukus shahri' },
  { regionCode: '1735', code: '1735225', nameUz: 'Nukus tumani' },
  { regionCode: '1735', code: '1735215', nameUz: "Qo'ng'irot tumani" },
  { regionCode: '1735', code: '1735218', nameUz: "Qonliko'l tumani" },
  { regionCode: '1735', code: '1735211', nameUz: "Qorao'zak tumani" },
  { regionCode: '1735', code: '1735243', nameUz: 'Shumanay tumani' },
  { regionCode: '1735', code: '1735228', nameUz: 'Taxiatosh tumani' },
  { regionCode: '1735', code: '1735230', nameUz: "Taxtako'pir tumani" },
  { regionCode: '1735', code: '1735233', nameUz: "To'rtko'l tumani" },
  { regionCode: '1735', code: '1735236', nameUz: "Xo'jayli tumani" },
  // Samarqand viloyati (1718)
  { regionCode: '1718', code: '1718206', nameUz: "Bulung'ur tumani" },
  { regionCode: '1718', code: '1718212', nameUz: 'Ishtixon tumani' },
  { regionCode: '1718', code: '1718209', nameUz: 'Jomboy tumani' },
  { regionCode: '1718', code: '1718406', nameUz: "Kattaqo'rg'on shahri" },
  { regionCode: '1718', code: '1718215', nameUz: "Kattaqo'rg'on tumani" },
  { regionCode: '1718', code: '1718218', nameUz: 'Narpay tumani' },
  { regionCode: '1718', code: '1718235', nameUz: 'Nurobod tumani' },
  { regionCode: '1718', code: '1718203', nameUz: 'Oqdaryo tumani' },
  { regionCode: '1718', code: '1718227', nameUz: "Pastdarg'om tumani" },
  { regionCode: '1718', code: '1718230', nameUz: 'Paxtachi tumani' },
  { regionCode: '1718', code: '1718224', nameUz: 'Payariq tumani' },
  { regionCode: '1718', code: '1718216', nameUz: "Qo'shrabot tumani" },
  { regionCode: '1718', code: '1718401', nameUz: 'Samarqand shahri' },
  { regionCode: '1718', code: '1718233', nameUz: 'Samarqand tumani' },
  { regionCode: '1718', code: '1718238', nameUz: 'Toyloq tumani' },
  { regionCode: '1718', code: '1718236', nameUz: 'Urgut tumani' },
  // Sirdaryo viloyati (1724)
  { regionCode: '1724', code: '1724212', nameUz: 'Boyovut tumani' },
  { regionCode: '1724', code: '1724401', nameUz: 'Guliston shahri' },
  { regionCode: '1724', code: '1724220', nameUz: 'Guliston tumani' },
  { regionCode: '1724', code: '1724228', nameUz: 'Mirzaobod tumani' },
  { regionCode: '1724', code: '1724206', nameUz: 'Oqoltin tumani' },
  { regionCode: '1724', code: '1724226', nameUz: 'Sardoba tumani' },
  { regionCode: '1724', code: '1724216', nameUz: 'Sayxunobod tumani' },
  { regionCode: '1724', code: '1724410', nameUz: 'Shirin shahri' },
  { regionCode: '1724', code: '1724231', nameUz: 'Sirdaryo tumani' },
  { regionCode: '1724', code: '1724235', nameUz: 'Xovos tumani' },
  { regionCode: '1724', code: '1724413', nameUz: 'Yangiyer shahri' },
  // Surxondaryo viloyati (1722)
  { regionCode: '1722', code: '1722202', nameUz: 'Angor tumani' },
  { regionCode: '1722', code: '1722203', nameUz: 'Bandixon tumani' },
  { regionCode: '1722', code: '1722204', nameUz: 'Boysun tumani' },
  { regionCode: '1722', code: '1722210', nameUz: 'Denov tumani' },
  { regionCode: '1722', code: '1722212', nameUz: "Jarqo'rg'on tumani" },
  { regionCode: '1722', code: '1722207', nameUz: 'Muzrabot tumani' },
  { regionCode: '1722', code: '1722201', nameUz: 'Oltinsoy tumani' },
  { regionCode: '1722', code: '1722215', nameUz: 'Qiziriq tumani' },
  { regionCode: '1722', code: '1722214', nameUz: "Qumqo'rg'on tumani" },
  { regionCode: '1722', code: '1722217', nameUz: 'Sariosiyo tumani' },
  { regionCode: '1722', code: '1722223', nameUz: 'Sherobod tumani' },
  { regionCode: '1722', code: '1722226', nameUz: "Sho'rchi tumani" },
  { regionCode: '1722', code: '1722401', nameUz: 'Termiz shahri' },
  { regionCode: '1722', code: '1722220', nameUz: 'Termiz tumani' },
  { regionCode: '1722', code: '1722221', nameUz: 'Uzun tumani' },
  // Toshkent shahar (1726)
  { regionCode: '1726', code: '1726264', nameUz: 'Bektemir tumani' },
  { regionCode: '1726', code: '1726294', nameUz: 'Chilonzor tumani' },
  { regionCode: '1726', code: '1726273', nameUz: 'Mirobod tumani' },
  { regionCode: '1726', code: '1726269', nameUz: "Mirzo Ulug'bek tumani" },
  { regionCode: '1726', code: '1726280', nameUz: 'Olmazor tumani' },
  { regionCode: '1726', code: '1726283', nameUz: 'Sergeli tumani' },
  { regionCode: '1726', code: '1726277', nameUz: 'Shayxontohur tumani' },
  { regionCode: '1726', code: '1726262', nameUz: 'Uchtepa tumani' },
  { regionCode: '1726', code: '1726287', nameUz: 'Yakkasaroy tumani' },
  { regionCode: '1726', code: '1726292', nameUz: 'Yangihayot tumani' },
  { regionCode: '1726', code: '1726290', nameUz: 'Yashnobod tumani' },
  { regionCode: '1726', code: '1726266', nameUz: 'Yunusobod tumani' },
  // Toshkent viloyati (1727)
  { regionCode: '1727', code: '1727407', nameUz: 'Angren shahri' },
  { regionCode: '1727', code: '1727413', nameUz: 'Bekobod shahri' },
  { regionCode: '1727', code: '1727220', nameUz: 'Bekobod tumani' },
  { regionCode: '1727', code: '1727228', nameUz: "Bo'ka tumani" },
  { regionCode: '1727', code: '1727224', nameUz: "Bo'stonliq tumani" },
  { regionCode: '1727', code: '1727256', nameUz: 'Chinoz tumani' },
  { regionCode: '1727', code: '1727419', nameUz: 'Chirchiq shahri' },
  { regionCode: '1727', code: '1727401', nameUz: 'Nurafshon shahri' },
  { regionCode: '1727', code: '1727415', nameUz: 'Ohangaron shahri' },
  { regionCode: '1727', code: '1727212', nameUz: 'Ohangaron tumani' },
  { regionCode: '1727', code: '1727404', nameUz: 'Olmaliq shahri' },
  { regionCode: '1727', code: '1727206', nameUz: "Oqqo'rg'on tumani" },
  { regionCode: '1727', code: '1727253', nameUz: "O'rta Chirchiq tumani" },
  { regionCode: '1727', code: '1727249', nameUz: 'Parkent tumani' },
  { regionCode: '1727', code: '1727250', nameUz: 'Piskent tumani' },
  { regionCode: '1727', code: '1727248', nameUz: 'Qibray tumani' },
  { regionCode: '1727', code: '1727233', nameUz: 'Quyi Chirchiq tumani' },
  { regionCode: '1727', code: '1727265', nameUz: 'Toshkent tumani' },
  { regionCode: '1727', code: '1727424', nameUz: "Yangiyo'l shahri" },
  { regionCode: '1727', code: '1727259', nameUz: "Yangiyo'l tumani" },
  { regionCode: '1727', code: '1727239', nameUz: 'Yuqori Chirchiq tumani' },
  { regionCode: '1727', code: '1727237', nameUz: 'Zangiota tumani' },
  // Xorazm viloyati (1733)
  { regionCode: '1733', code: '1733204', nameUz: "Bog'ot tumani" },
  { regionCode: '1733', code: '1733208', nameUz: 'Gurlan tumani' },
  { regionCode: '1733', code: '1733220', nameUz: 'Hazorasp tumani' },
  { regionCode: '1733', code: '1733212', nameUz: "Qo'shko'pir tumani" },
  { regionCode: '1733', code: '1733230', nameUz: 'Shovot tumani' },
  { regionCode: '1733', code: '1733221', nameUz: "Tuproqqal'a tumani" },
  { regionCode: '1733', code: '1733401', nameUz: 'Urganch shahri' },
  { regionCode: '1733', code: '1733217', nameUz: 'Urganch tumani' },
  { regionCode: '1733', code: '1733406', nameUz: 'Xiva shahri' },
  { regionCode: '1733', code: '1733226', nameUz: 'Xiva tumani' },
  { regionCode: '1733', code: '1733223', nameUz: 'Xonqa tumani' },
  { regionCode: '1733', code: '1733233', nameUz: 'Yangiariq tumani' },
  { regionCode: '1733', code: '1733236', nameUz: 'Yangibozor tumani' },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seed boshlandi...');

  // 1) Viloyatlarni kiritish
  console.log('📍 Viloyatlar kiritilmoqda...');
  const insertedRegions = await db
    .insert(regions)
    .values(regionsData)
    .onConflictDoNothing()
    .returning({ id: regions.id, code: regions.code });

  const regionMap = new Map(insertedRegions.map((r) => [r.code, r.id]));
  console.log(`   ✅ ${insertedRegions.length} ta viloyat kiritildi`);

  // 2) Tumanlarni kiritish
  console.log('📍 Tumanlar kiritilmoqda...');
  const districtsWithIds = districtsData
    .map((d) => ({ ...d, regionId: regionMap.get(d.regionCode)! }))
    .filter((d) => d.regionId);

  const insertedDistricts = await db
    .insert(districts)
    .values(districtsWithIds.map(({ regionCode: _, ...d }) => d))
    .onConflictDoNothing()
    .returning({ id: districts.id });

  console.log(`   ✅ ${insertedDistricts.length} ta tuman kiritildi`);

  // 3) Admin foydalanuvchisini yaratish
  console.log('👤 Admin foydalanuvchi yaratilmoqda...');
  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  await db
    .insert(users)
    .values({
      username: 'admin',
      passwordHash,
      fullName: 'Tizim administratori',
      role: 'admin',
    })
    .onConflictDoNothing();

  console.log('   ✅ Admin yaratildi  →  login: admin  |  parol: Admin@12345');
  console.log('\n✅ Seed muvaffaqiyatli yakunlandi!');
}

seed()
  .catch((err) => {
    console.error('❌ Seed xatosi:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
