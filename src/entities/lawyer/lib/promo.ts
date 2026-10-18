// Whole days a paid placement still runs ("6 kun qoldi"); -1 when it has no end date.
export const daysLeft = (iso: string): number => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : -1);
