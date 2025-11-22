import {
  pgTable,
  text,
  timestamp,
  decimal,
  integer,
  date,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const weeklyReports = pgTable("weekly_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  weekStartDate: date("week_start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userWeekUnique: uniqueIndex("weekly_reports_user_week_unique").on(table.userId, table.weekStartDate),
}));

export const dailyTimeEntries = pgTable("daily_time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  weeklyReportId: uuid("weekly_report_id")
    .notNull()
    .references(() => weeklyReports.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun, 1=Mon, 2=Tue, etc.
  hours: decimal("hours", { precision: 4, scale: 2 })
    .notNull()
    .default("0"),
  projectName: text("project_name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  reportDayUnique: uniqueIndex("daily_time_entries_report_day_unique").on(table.weeklyReportId, table.dayOfWeek),
}));

export type SelectWeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = typeof weeklyReports.$inferInsert;
export type SelectDailyTimeEntry = typeof dailyTimeEntries.$inferSelect;
export type InsertDailyTimeEntry = typeof dailyTimeEntries.$inferInsert;