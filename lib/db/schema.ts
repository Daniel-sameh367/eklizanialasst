import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const stations = pgTable("stations", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Available"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
