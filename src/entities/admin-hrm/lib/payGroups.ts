export type PayGroup = "bonus" | "penalty" | "advance" | "salary";

const GROUP: Record<string, PayGroup> = { kpi_bonus: "bonus", sales_bonus: "bonus", one_time_bonus: "bonus", penalty: "penalty", deduction: "penalty", advance: "advance" };

export const PAY_GROUPS: PayGroup[] = ["salary", "bonus", "advance", "penalty"];
export const PAY_COLOR: Record<PayGroup, string> = { salary: "#1668F0", bonus: "#22C55E", advance: "#F59E0B", penalty: "#EF4444" };

// Entry type -> the four buckets of the payroll hero (salary also holds adjustments).
export const payGroup = (type: string): PayGroup => GROUP[type] ?? "salary";
