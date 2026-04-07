import {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { applicationStatusEnum, actionTypeEnum } from './enums';
import { applications } from './applications';
import { users } from './users';

export const applicationHistory = pgTable('application_history', {
  id: serial('id').primaryKey(),

  applicationId: integer('application_id')
    .references(() => applications.id, { onDelete: 'cascade' })
    .notNull(),

  // Qaysi holatdan qaysi holatga o'tdi
  fromStatus: applicationStatusEnum('from_status'),
  toStatus: applicationStatusEnum('to_status').notNull(),

  actionType: actionTypeEnum('action_type').notNull(),

  // Kim bajargan
  performedBy: integer('performed_by')
    .references(() => users.id)
    .notNull(),

  // Izoh (qaytarish sababi, komissiya xulosasi matni, va h.k.)
  comment: text('comment'),

  // Biriktirilgan fayllar yo'llari massivi: ["/uploads/doc1.pdf", ...]
  attachments: jsonb('attachments').$type<string[]>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
