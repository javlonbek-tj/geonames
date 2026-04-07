import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { regions } from './regions';
import { districts } from './districts';
import { users } from './users';
import { objectTypes } from './object-types';

export const geographicObjects = pgTable('geographic_objects', {
  id: serial('id').primaryKey(),

  nameUz: varchar('name_uz', { length: 200 }).notNull(),
  nameKrill: varchar('name_krill', { length: 200 }),

  // Tur: admin paneldan kiritilgan (Ko'cha, Mahalla, Maydon, va h.k.)
  objectTypeId: integer('object_type_id')
    .references(() => objectTypes.id)
    .notNull(),

  regionId: integer('region_id')
    .references(() => regions.id)
    .notNull(),
  districtId: integer('district_id')
    .references(() => districts.id)
    .notNull(),

  // Google Maps orqali DKP filial xodimi chizgan GeoJSON geometriya
  // { type: "Point" | "Polygon" | "LineString", coordinates: [...] }
  geometry: jsonb('geometry'),

  // Reestrdagi unikal raqam — 1.1-qadamda tuman komissiyasi tomonidan biriktiriladi
  registryNumber: varchar('registry_number', { length: 50 }).unique(),

  // DKP filial tomonidan belgilanadi: reestrdа mavjudmi yoki yo'qmi
  existsInRegistry: boolean('exists_in_registry'),

  createdBy: integer('created_by')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
