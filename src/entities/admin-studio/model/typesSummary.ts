// GET /studio/objects/summary: the dashboard numbers, counted by the server (never from paginated lists).
export type EntityCard = {
  key: string;
  title: string;
  code: string;
  total: number;
  active: number;
  inactive: number;
  incomplete: number;
  studioObjects: number;
  listUrl: string;
  incompleteUrl: string;
  createUrl: string;
};
export type StudioSummary = {
  total: number;
  activeTotal: number;
  incompleteTotal: number;
  byStatus: Record<string, number>;
  /** Studio objects per constructor, archived ones left out. */
  perCode: Record<string, number>;
  cards: EntityCard[];
};
