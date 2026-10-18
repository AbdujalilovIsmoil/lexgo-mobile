// One colour per attendance status (strip of a day row and cells of the month strip).
const TINT: Record<string, string> = { present: "#22C55E", late: "#F59E0B", absent: "#EF4444", active: "#22C55E" };
export const dayTint = (status: string): string => TINT[status.trim().toLowerCase()] ?? "#64748B";
