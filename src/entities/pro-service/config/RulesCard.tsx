import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { Button, Icon, Pill, PressableScale, Text, type PillTone } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel";
import { ShowMore, useShowMore } from "@/shared/ui/profile";
import { ruleParagraphs, type ServiceRule } from "@/entities/service-rules";
import { ConfigCard } from "./ConfigCard";
import { useConfigPatch } from "./queries";
import type { ServiceConfig } from "./types";

type Props = { serviceId: string; config: ServiceConfig; onRules: (missing: string[], rules: ServiceRule[]) => void };

const DONE = /^(accepted|all_accepted|ok|complete|completed|satisfied|met|done)$/;
const NONE = /^(none|not_required|no_rules|not_applicable|empty)$/;

// Rules of this service (TZ.md §5.3): the backend's rules_status, the required rules — accepted or still missing — and the ones
// the seller picks for the service (a pick PATCHes selected_rule_ids at once). Missing rules block switching the service on; the
// button opens them in the rules sheet.
export function RulesCard({ serviceId, config: c, onRules }: Props) {
  const col = useColors();
  const { t } = useT();
  const open = (missing: string[] = []) => onRules(missing.length ? missing : c.missingRuleIds, c.requiredRules);
  const m = useConfigPatch((_id, missing) => open(missing));
  const required = useShowMore(c.requiredRules, serviceId);
  const selectable = useShowMore(c.selectableRules, serviceId);
  if (!c.requiredRules.length && !c.selectableRules.length && !c.rulesStatus && !c.rulesPending) return null;
  const missing = new Set(c.missingRuleIds);
  const asked = m.isPending ? m.variables?.patch.selectedRuleIds : undefined;
  const picked = (asked ?? c.selectedRuleIds ?? []).filter((id) => c.selectableRules.some((r) => r.id === id));
  const pick = (id: string) => m.mutate({ serviceId, patch: { selectedRuleIds: picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id] } });
  const st = c.rulesStatus;
  const pill: [string, PillTone] | null = c.rulesPending ? [t("svcRules.rulesStateNew"), "warn"] : DONE.test(st) ? [t("svcRules.rulesStateAccepted"), "ok"] : NONE.test(st) ? [t("scfg.rulesNone"), "gray"] : st ? [humanizeSlug(st), "gray"] : null;
  return (
    <ConfigCard title={t("scfg.rulesTitle")} right={pill ? <Pill label={pill[0]} tone={pill[1]} small /> : null}>
      {c.rulesPending ? (
        <View style={s.block}>
          <Notice tone="warn" icon="lock" text={c.missingRuleIds.length ? t("scfg.rulesMissing", { n: c.missingRuleIds.length }) : t("svcRules.rulesLockReason")} />
          <Button title={t("svcRules.rulesBannerAction")} variant="soft" size="sm" onPress={() => open()} />
        </View>
      ) : null}
      {c.requiredRules.length ? <Text variant="caption" tone="gray" weight="bold">{t("scfg.requiredTitle")}</Text> : null}
      {required.visible.map((r) => {
        const miss = missing.has(r.id);
        const state = t(miss ? "svcRules.rulesStateNew" : "svcRules.rulesStateAccepted");
        return (
          <View key={r.id || r.title} style={s.row} accessible accessibilityLabel={`${r.title || r.key}: ${state}`}>
            <Icon name={miss ? "alert-circle" : "check-circle"} size={18} color={miss ? col.warn : col.ok} />
            <View style={s.flex}>
              <Text variant="small">{r.title || r.key}</Text>
              {r.version ? <Text variant="caption" tone="gray">{t("svcRules.rulesVersion", { version: r.version })}</Text> : null}
            </View>
          </View>
        );
      })}
      <ShowMore left={required.left} expanded={required.expanded} onMore={required.more} onLess={required.less} />
      {c.selectableRules.length ? (
        <View style={s.block}>
          <Text variant="caption" tone="gray" weight="bold">{t("scfg.selectableTitle")}</Text>
          <Text variant="caption" tone="gray">{t("scfg.selectableHint")}</Text>
        </View>
      ) : null}
      {selectable.visible.map((r) => {
        const on = picked.includes(r.id);
        const preview = ruleParagraphs(r.body)[0] ?? "";
        return (
          <PressableScale key={r.id} onPress={() => pick(r.id)} disabled={m.isPending} accessibilityRole="checkbox" accessibilityLabel={r.title || r.key} accessibilityState={{ checked: on, disabled: m.isPending }} style={[s.pick, { borderColor: on ? col.accent : col.line }]}>
            <View style={[s.box, { borderColor: on ? col.accent : col.gray2, backgroundColor: on ? col.accent : "transparent" }]}>{on ? <Icon name="check" size={14} tone="white" /> : null}</View>
            <View style={s.flex}>
              <Text variant="small" weight="semibold">{r.title || r.key}</Text>
              {preview ? <Text variant="caption" tone="gray" numberOfLines={2}>{preview}</Text> : null}
            </View>
          </PressableScale>
        );
      })}
      <ShowMore left={selectable.left} expanded={selectable.expanded} onMore={selectable.more} onLess={selectable.less} />
    </ConfigCard>
  );
}

const s = StyleSheet.create({
  block: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 32 },
  flex: { flex: 1, gap: 2 },
  pick: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, padding: 12, borderRadius: radius.r, borderWidth: 1.5 },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
