import { useEffect, useRef } from "react";
import type { View } from "react-native";
import { useIsFocused } from "expo-router";
import { measureView } from "./measure";
import { claimPage, raTouch, registerControl } from "./registry";
import type { RaControlSpec } from "./types";

/** The screen's page id for remote assistance (`client.subscription` …), claimed while the screen is in front. */
export function useRaPage(pageId: string): void {
  const front = useIsFocused();
  useEffect(() => (front && pageId ? claimPage(pageId) : undefined), [front, pageId]);
}

// Puts a control on the operator's map while its screen is in front (`on` false takes it off, e.g. while data loads). The handlers are
// always the latest ones; a changed state tells the publisher. Spread the result on the View that wraps the control (it is measured
// for the highlight):
//   const term = useRaControl({ id: "subscription.ai.term", label, actions: RA_PICK, state: "selected", select });
//   <View {...term}><Segmented … /></View>
export function useRaControl(spec: RaControlSpec, on = true) {
  const front = useIsFocused();
  const node = useRef<View>(null);
  const latest = useRef(spec);
  useEffect(() => {
    latest.current = spec;
  });
  const live = front && on && !!spec.id;
  const identity = [spec.id, spec.label, spec.sensitivity ?? "", spec.actions.join(",")].join("|");
  useEffect(() => {
    if (!live) return;
    return registerControl({ read: () => latest.current, measure: () => measureView(node.current) });
  }, [live, identity]);
  const state = spec.state ?? "ready";
  useEffect(() => {
    if (live) raTouch();
  }, [live, state]);
  return { ref: node, collapsable: false } as const;
}
