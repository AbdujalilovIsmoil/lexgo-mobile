import { useRef, useState } from "react";
import type { LayoutChangeEvent, ScrollView } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { achIssues, achKeys, achievementErrorOf, submitAchievement, type AchInput, type AchIssue, type AchServerError, type AchSlot } from "@/entities/pro-achievements";
import { useExpCategories } from "@/entities/pro-experience";
import { toast, useErrorText } from "@/shared/ui";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { todayKey } from "@/shared/lib/pro/dates";
import { useT } from "@/shared/i18n";
import { useAchEvidence } from "./useAchEvidence";

const ISSUE_SLOT: Record<AchIssue, AchSlot> = { type: "type", title: "title", date: "date", description: "description", files: "evidence" };
const EMPTY: AchInput = { type: "", title: "", categoryId: "", achievedOn: "", description: "", evidenceIds: [] };

// State of one opening of the form. A refused submission marks the inputs the server named (422 / detail.field) with its own sentence
// and scrolls to the first of them; what names no input shows on top of the sheet.
export function useAchForm(onClose: () => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const errText = useErrorText();
  const cats = useExpCategories();
  const ev = useAchEvidence();
  const [v, setV] = useState<AchInput>(EMPTY);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [server, setServer] = useState<AchServerError | null>(null);
  const [banner, setBanner] = useState("");
  const scroll = useRef<ScrollView>(null);
  const ys = useRef<Partial<Record<AchSlot, number>>>({});
  const input = { ...v, evidenceIds: ev.ids };
  const issues = achIssues(input, todayKey());

  const reveal = (slots: AchSlot[]) => {
    const y = Math.min(...slots.map((k) => ys.current[k] ?? Number.POSITIVE_INFINITY));
    scroll.current?.scrollTo({ y: Number.isFinite(y) ? Math.max(0, y - 12) : 0, animated: true });
  };
  const anchor = (slot: AchSlot) => (e: LayoutChangeEvent) => {
    ys.current[slot] = e.nativeEvent.layout.y;
  };
  // Editing an input clears what the server said about it.
  const touch = (...slots: AchSlot[]) => setServer((x) => (x?.slots.some((k) => slots.includes(k)) ? { ...x, slots: x.slots.filter((k) => !slots.includes(k)) } : x));
  const set = (p: Partial<AchInput>, ...slots: AchSlot[]) => {
    setV((cur) => ({ ...cur, ...p }));
    touch(...slots);
  };
  const err = (slot: AchSlot): string | undefined => {
    const k = tried ? issues.find((i) => ISSUE_SLOT[i] === slot) : undefined;
    if (k) return t(`ach.issue.${k}`);
    return server?.slots.includes(slot) ? server.message || t("ach.err.check") : undefined;
  };

  const submit = async () => {
    setTried(true);
    if (issues.length) return reveal(issues.map((k) => ISSUE_SLOT[k]));
    if (busy || ev.busy) return;
    setBusy(true);
    setBanner("");
    setServer(null);
    try {
      await submitAchievement(input);
      successHaptic();
      toast(t("ach.sent"), "ok");
      void qc.invalidateQueries({ queryKey: achKeys.all });
      onClose();
    } catch (e) {
      errorHaptic();
      const x = achievementErrorOf(e);
      if (x) setServer(x);
      else setBanner(errText(e) || t("ach.failed"));
      reveal(x?.slots ?? []);
    } finally {
      setBusy(false);
    }
  };

  return { v, set, touch, ev, err, banner, busy, submit, scroll, anchor, cats, today: todayKey };
}
