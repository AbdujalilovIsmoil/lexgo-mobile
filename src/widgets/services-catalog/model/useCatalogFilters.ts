import { useState } from "react";
import type { DirSize, DocFilter, ExecFilter, PriceFilter, SubSort, SvcSort } from "@/entities/service";

export type CatalogFilters = ReturnType<typeof useCatalogFilters>;

// Three service filters + the service sort (service screens), size + subcategory sort (direction screens).
export function useCatalogFilters() {
  const [doc, setDoc] = useState<DocFilter>("all");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [exec, setExec] = useState<ExecFilter>("all");
  const [svcSort, setSvcSort] = useState<SvcSort>("rel");
  const [subSort, setSubSort] = useState<SubSort>("count");
  const [size, setSize] = useState<DirSize>("all");
  const reset = (services: boolean) => {
    if (services) {
      setDoc("all");
      setPrice("all");
      setExec("all");
      setSvcSort("rel");
    } else {
      setSize("all");
      setSubSort("count");
    }
  };
  const dirty = (services: boolean) => (services ? doc !== "all" || price !== "all" || exec !== "all" || svcSort !== "rel" : size !== "all" || subSort !== "count");
  return { doc, price, exec, svcSort, subSort, size, setDoc, setPrice, setExec, setSvcSort, setSubSort, setSize, reset, dirty };
}
