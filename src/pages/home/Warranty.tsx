import { useState } from "react";
import { StatSheet } from "@/widgets/stat-sheets";
import { WarrantyCard } from "@/widgets/promo-cards";

// The guarantee card; tapping it opens the drawer that explains the four warranty steps.
export function Warranty() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <WarrantyCard onPress={() => setOpen("response")} />
      <StatSheet statKey={open} onClose={() => setOpen(null)} />
    </>
  );
}
