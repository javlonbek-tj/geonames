import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { applicationStatusEnum } from './enums';
import { users } from './users';

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),

  // Ariza raqami: avtomatik generatsiya qilinadi (masalan: GEO-2024-00001)
  applicationNumber: varchar('application_number', { length: 50 })
    .notNull()
    .unique(),

  // Hozirgi holat (workflow bosqichi)
  currentStatus: applicationStatusEnum('current_status')
    .notNull()
    .default('step_1_geometry_uploaded'),

  // Hozirgi mas'ul xodim (keyingi harakat kimga tegishli)
  currentHandlerId: integer('current_handler_id').references(() => users.id),

  // Arizani yaratgan DKP filial xodimi
  createdBy: integer('created_by')
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
