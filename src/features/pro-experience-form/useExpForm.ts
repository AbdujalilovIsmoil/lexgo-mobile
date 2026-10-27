import { useRef, useState } from "react";
import type { LayoutChangeEvent, ScrollView } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { DESCRIPTION_MIN, expIssues, expKeys, experienceErrorOf, resultLabel, stageLabel, submitExperience, useExpCategories } from "@/entities/pro-experience";
import type { ExpGroup, ExpInput, ExpIssue, ExpRecord, ExpServerError, ExpSlot } from "@/entities/pro-experience";
import { toast, useErrorText } from "@/shared/ui";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { useEvidence } from "./useEvidence";

const iso = (v: string) => v.slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);
const ISSUE_SLOT: Record<ExpIssue, ExpSlot> = { category: "category", subcategory: "subcategory", workplace: "workplace", position: "position", started: "started", ended: "ended", description: "description", contacts: "description" };

const startOf = (r: ExpRecord | null, sourceId: string): ExpInput => ({
  sourceId,
  categoryId: r?.categoryId ?? "",
  subcategoryId: r?.subcategoryId ?? "",
  workplace: r?.workplace ?? "",
  position: r?.position ?? "",
  startedOn: r?.startedAt ? iso(r.startedAt) : "",
  endedOn: r?.endedAt ? iso(r.endedAt) : "",
  isCurrent: r ? r.isCurrent : false,
  description: r?.description ?? "",
  stages: r?.stages ?? [],
  results: r?.results ?? [],
  evidenceIds: [],
});

// State of one opening of the form: `base` is the revision it starts from (the verified one, or a rejected edit being fixed), an edit
// always names the verified revision as its source (§3.6). A refused submission marks the inputs the server named (§3.12) and scrolls to
// the first of them; what names no input shows on top.
export function useExpForm(group: ExpGroup | null, base: ExpRecord | null, onClose: () => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const errText = useErrorText();
  const cats = useExpCategories();
  const [v, setV] = useState<ExpInput>(() => startOf(base, group?.current?.id ?? ""));
  const ev = useEvidence(base?.evidence ?? []);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [server, setServer] = useState<ExpServerError | null>(null);
  const [banner, setBanner] = useState("");
  const scroll = useRef<ScrollView>(null);
  const ys = useRef<Partial<Record<ExpSlot, number>>>({});
  const input = { ...v, evidenceIds: ev.ids };
  const issues = expIssues(input, today(), cats.data);

  const reveal = (slots: ExpSlot[]) => {
    const y = Math.min(...slots.map((k) => ys.current[k] ?? Number.POSITIVE_INFINITY));
    scroll.current?.scrollTo({ y: Number.isFinite(y) ? Math.max(0, y - 12) : 0, animated: true });
  };
  const anchor = (slot: ExpSlot) => (e: LayoutChangeEvent) => {
    ys.current[slot] = e.nativeEvent.layout.y;
  };
  // Editing an input clears what the server said about it.
  const touch = (...slots: ExpSlot[]) => setServer((x) => (x?.slots.some((k) => slots.includes(k)) ? { ...x, slots: x.slots.filter((k) => !slots.includes(k)) } : x));
  const set = (p: Partial<ExpInput>, ...slots: ExpSlot[]) => {
    setV((cur) => ({ ...cur, ...p }));
    touch(...slots);
  };

  const known = (code: string) => (code && t(`mf.exp.err.${code}`) !== `mf.exp.err.${code}` ? t(`mf.exp.err.${code}`) : "");
  const label = (slot: ExpSlot, x: string) =>
    slot === "stages" ? stageLabel(x, t) : slot === "results" ? resultLabel(x, t) : slot === "evidence" ? (ev.rows.find((r) => r.saved?.id === x)?.name ?? x) : x;
  // The entry an overlap points at, from the list the page has already read.
  const nameOf = (id: string) => {
    const g = id ? qc.getQueryData<ExpGroup[]>(expKeys.mine)?.find((x) => [x.rootId, x.current?.id, x.pending?.id, x.latest?.id].includes(id)) : undefined;
    const r = g?.current ?? g?.latest;
    return r ? [r.position, r.workplace].filter(Boolean).join(" · ") : "";
  };
  const serverText = (x: ExpServerError, slot: ExpSlot): string => {
    if (x.code === "experience_fields_required") return t("pxp.form.required");
    const other = x.code === "experience_dates_overlap" ? nameOf(x.conflictId) : "";
    if (other) return t("pxp.form.overlap", { name: other });
    const text = known(x.code) || t("pxp.form.check");
    return x.values.length ? `${text}. ${t("pxp.form.refused", { list: x.values.map((y) => label(slot, y)).join(", ") })}` : text;
  };
  const err = (slot: ExpSlot): string | undefined => {
    const k = tried ? issues.find((i) => ISSUE_SLOT[i] === slot) : undefined;
    if (k) return k === "subcategory" ? t("pxp.issue.subcategory") : t(`mf.exp.issue.${k}`, { n: DESCRIPTION_MIN });
    return server?.slots.includes(slot) ? serverText(server, slot) : undefined;
  };

  const submit = async () => {
    setTried(true);
    if (issues.length) return reveal(issues.map((k) => ISSUE_SLOT[k]));
    if (busy || ev.busy) return;
    setBusy(true);
    setBanner("");
    setServer(null);
    try {
      await submitExperience(input);
      successHaptic();
      toast(t("mf.exp.sent"), "ok");
      void qc.invalidateQueries({ queryKey: expKeys.all });
      onClose();
    } catch (e) {
      errorHaptic();
      const x = experienceErrorOf(e);
      // Another edit is already under review: the list shows it (and its "cancel") after a refresh.
      if (x?.code === "experience_revision_already_pending") void qc.invalidateQueries({ queryKey: expKeys.all });
      if (x?.slots.length) setServer(x);
      else setBanner(known(x?.code ?? "") || errText(e) || t("mf.exp.failed"));
      reveal(x?.slots ?? []);
    } finally {
      setBusy(false);
    }
  };

  return { v, set, touch, ev, err, banner, busy, submit, scroll, anchor, cats, cat: cats.data?.find((x) => x.id === v.categoryId), today };
}
