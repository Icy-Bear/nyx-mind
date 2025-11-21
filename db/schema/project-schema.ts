import {
  pgTable,
  varchar,
  timestamp,
  interval,
  numeric,
  integer,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectName: varchar("project_name", { length: 255 }).notNull(),
  summary: text("summary"),

  plannedStart: timestamp("planned_start"),
  plannedEnd: timestamp("planned_end"),
  plannedDuration: interval("planned_duration"),

  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  actualDuration: interval("actual_duration"),

  percentComplete: numeric("percent_complete", {
    precision: 5,
    scale: 2,
  }).default("0"),

  predecessorLag: integer("predecessor_lag"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const projectAssignees = pgTable("project_assignees", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
