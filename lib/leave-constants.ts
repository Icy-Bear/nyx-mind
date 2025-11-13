export const LEAVE_CONSTANTS = {
  WORKING_DAYS_PER_MONTH: 22,
  CL_ACCRUAL_RATE_PER_DAY: 0.03030303,
} as const;

export type LeaveConstants = typeof LEAVE_CONSTANTS;