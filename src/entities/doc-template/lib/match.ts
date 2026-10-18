export type DocTemplate = { id: string; name: string; category: string; language: string };

// Case-insensitive match on name and category.
export const matchTemplates = (rows: DocTemplate[], q: string): DocTemplate[] => {
  const n = q.trim().toLowerCase();
  return n ? rows.filter((r) => `${r.name} ${r.category}`.toLowerCase().includes(n)) : rows;
};
