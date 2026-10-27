import type { UserEvent } from "@/shared/realtime";
import { asDict, asStr } from "@/shared/lib/json";

const RULE = /^marketplace[._]rule_accepted$/;

// The rule a marketplace.rule_accepted is about (on the event, under data / payload, or as a rule object), or the rule of a
// notification.created that wraps one. "" = not a rule event, or one without a rule id (TZ.md §10: check the id first).
export function acceptedRuleOf(e: UserEvent): string {
  if (e.event === "notification.created") {
    const n = asDict(e.notification ?? e);
    const data = { ...asDict(n.meta ?? n.metadata), ...asDict(n.data) };
    if (!RULE.test(asStr(data.event ?? n.event ?? n.event_type ?? n.type))) return "";
    return asStr(data.rule_id ?? (/rule/.test(asStr(n.entity_type)) ? n.entity_id : "")).trim();
  }
  if (!RULE.test(e.event)) return "";
  for (const d of [e, asDict(e.data), asDict(e.payload), asDict(asDict(e.data).payload)]) {
    const id = asStr(d.rule_id ?? asDict(d.rule).id).trim();
    if (id) return id;
  }
  return "";
}
