// "budgetDesc" → "BudgetDesc": builds translation keys such as `mkt.sort${cap(k)}`.
export const cap = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);
