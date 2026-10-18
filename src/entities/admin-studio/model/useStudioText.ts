import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { ctorMeta } from "./ctorMeta";
import type { StudioStatus } from "./types";

// Labels of the studio vocabulary (statuses, roles, constructors, groups, field errors).
export function useStudioText() {
  const { t, locale } = useT();
  const has = (k: string) => t(k) !== k;
  const pick = (k: string, raw: string) => (has(k) ? t(k) : humanizeSlug(raw));
  return {
    t,
    locale,
    status: (s: StudioStatus, raw = "") => (/^(rejected|declined)$/i.test(raw.trim()) && s === "changes_requested" ? t("admStudio.status.rejected") : t(`admStudio.status.${s}`)),
    ctorName: (code: string, fallback = "") => {
      const k = ctorMeta(code).key;
      return k && has(`admStudio.ctor.${k}`) ? t(`admStudio.ctor.${k}`) : fallback || code;
    },
    group: (g: string, title = "") => (has(`ntd.studioV2.group.${g}`) ? t(`ntd.studioV2.group.${g}`) : has(`admStudio.group.${g}`) ? t(`admStudio.group.${g}`) : title || humanizeSlug(g)),
    role: (r: string) => pick(`admStudio.role.${r}`, r),
    stepStatus: (s: string) => pick(`admStudio.stepStatus.${s}`, s),
    fieldErr: (m: string) => (!m.startsWith("@") ? m : has(`admStudioB.err.${m.slice(1)}`) ? t(`admStudioB.err.${m.slice(1)}`) : has(`ntd.studioV2.err.${m.slice(1)}`) ? t(`ntd.studioV2.err.${m.slice(1)}`) : m),
    duration: (sec: number) => {
      const s = Math.max(0, Math.round(sec));
      return s >= 3600 ? t("admStudio.fmt.hm", { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60) }) : s >= 60 ? t("admStudio.fmt.m", { m: Math.floor(s / 60) }) : t("admStudio.fmt.s", { s });
    },
  };
}
