import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  date,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const leaveBalances = pgTable("leave_balances", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  clBalance: decimal("cl_balance", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  mlBalance: integer("ml_balance").default(0).notNull(),
  lastClAccrual: timestamp("last_cl_accrual").defaultNow().notNull(),
  lastMlAccrual: timestamp("last_ml_accrual").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  leaveType: text("leave_type").notNull(), // 'CL' or 'ML'
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
  totalDays: integer("total_days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("Pending").notNull(), // 'Pending', 'Approved', 'Rejected'
  approvedBy: text("approved_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type SelectLeaveBalance = typeof leaveBalances.$inferSelect;
export type SelectLeaveRequest = typeof leaveRequests.$inferSelect;

export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;
