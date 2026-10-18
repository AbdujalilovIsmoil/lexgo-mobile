import { useState } from "react";
import type { SortKey, TypeFilter } from "@/entities/pro-files";

// Type + sort of the browser; "active" counts how many differ from the defaults (the badge on the filter button).
export function useFileFilters() {
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");
  return { type, sort, setType, setSort, active: (type !== "all" ? 1 : 0) + (sort !== "name" ? 1 : 0), reset: () => { setType("all"); setSort("name"); } };
}
export type FileFilters = ReturnType<typeof useFileFilters>;
