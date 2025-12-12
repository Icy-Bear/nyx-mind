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

import { projects } from "./project-schema";

export const weeklyReports = pgTable("weekly_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" }),
  weekStartDate: date("week_start_date").notNull(),
  targetHours: decimal("target_hours", { precision: 4, scale: 2 })
    .default("40.00")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userWeekProjectUnique: uniqueIndex("weekly_reports_user_week_project_unique").on(table.userId, table.weekStartDate, table.projectId),
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
  reportDayProjectUnique: uniqueIndex("daily_time_entries_report_day_project_unique").on(table.weeklyReportId, table.dayOfWeek, table.projectName),
}));

export type SelectWeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = typeof weeklyReports.$inferInsert;
export type SelectDailyTimeEntry = typeof dailyTimeEntries.$inferSelect;
export type InsertDailyTimeEntry = typeof dailyTimeEntries.$inferInsert;