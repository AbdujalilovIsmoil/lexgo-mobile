import { useState } from "react";

export type CatalogNav = ReturnType<typeof useCatalogNav>;

// Where the client is in the catalogue: [family strip] -> category -> subcategory -> services.
// Seeded from the route (?cat, ?subcat, ?q) so a deep link lands on the same screen the web shows.
export function useCatalogNav(init: { cat?: string; subcat?: string; q?: string }) {
  const [cat, setCatState] = useState(init.cat ?? "");
  const [subcat, setSubcat] = useState(init.subcat ?? "");
  const [q, setQ] = useState(init.q ?? "");
  const [fam, setFam] = useState("");
  // A stale subcategory never survives a category change.
  const setCat = (c: string) => {
    setCatState(c);
    setSubcat("");
  };
  const openSubcat = (c: string, name: string) => {
    setCatState(c);
    setSubcat(name);
  };
  const searching = q.trim().length >= 2;
  const back = () => (subcat ? setSubcat("") : setCat(""));
  return { cat, subcat, q, fam, searching, setCat, setSubcat, setQ, setFam, openSubcat, back };
}
