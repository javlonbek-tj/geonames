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
import { applications } from './applications';

export const geographicObjects = pgTable('geographic_objects', {
  id: serial('id').primaryKey(),

  // Bitta ariza ostidagi bir nechta ob'yektdan biri
  applicationId: integer('application_id')
    .references(() => applications.id)
    .notNull(),

  nameUz: varchar('name_uz', { length: 200 }).notNull(),
  nameKrill: varchar('name_krill', { length: 200 }),

  objectTypeId: integer('object_type_id')
    .references(() => objectTypes.id)
    .notNull(),

  regionId: integer('region_id')
    .references(() => regions.id)
    .notNull(),
  districtId: integer('district_id')
    .references(() => districts.id)
    .notNull(),

  geometry: jsonb('geometry'),

  registryNumber: varchar('registry_number', { length: 50 }).unique(),

  existsInRegistry: boolean('exists_in_registry'),

  createdBy: integer('created_by')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
