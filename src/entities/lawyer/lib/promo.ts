// Whole days a paid placement still runs ("6 kun qoldi"); -1 when it has no end date.
export const daysLeft = (iso: string): number => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : -1);

// The placement's end date has passed (a copy kept on the phone may outlive it); false when it has no end date.
export const hasEnded = (iso: string): boolean => !!iso && new Date(iso).getTime() <= Date.now();
