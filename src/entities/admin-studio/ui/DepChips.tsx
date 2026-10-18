import { Pill } from "@/shared/ui";
import type { CtorNav } from "../model/typesNav";
import { useT } from "@/shared/i18n";

// Position in the group's sequence and what must exist first — all values come from the catalogue.
export function DepChips({ nav }: { nav?: CtorNav }) {
  const { t } = useT();
  if (!nav || !nav.step) return null;
  const blocked = nav.availability === "blocked" || nav.missing.length > 0;
  return (
    <>
      <Pill label={`${nav.step}/${nav.steps}`} tone="gray" icon="list" small />
      {nav.completed ? <Pill label={t("ntd.studioV2.done")} tone="ok" icon="check" small /> : null}
      {blocked ? <Pill label={t("ntd.studioV2.blocked", { codes: nav.missing.join(", ") })} tone="warn" icon="lock" small /> : nav.before.length ? <Pill label={t("ntd.studioV2.after", { codes: nav.before.join(", ") })} tone="blue" icon="corner-down-right" small /> : null}
    </>
  );
}
