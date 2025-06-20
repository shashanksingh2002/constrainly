import { pgTable, serial, varchar, text, timestamp, index } from "drizzle-orm/pg-core"

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    lastLoggedInAt: timestamp("last_logged_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar("created_by", { length: 255 }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: varchar("updated_by", { length: 255 }),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    createdAtIdx: index("idx_users_created_at").on(table.createdAt),
    lastLoggedInIdx: index("idx_users_last_logged_in").on(table.lastLoggedInAt),
  }),
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
