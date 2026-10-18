import { useMemo, useState } from "react";
import { View } from "react-native";
import { JOURNAL_KINDS, JOURNAL_PERIODS, countKinds, filterJournal, kindIcon, toggleKind, type JournalEntry, type JournalFilter, type JournalKind, type JournalPeriod } from "@/entities/security";
import { radius, useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { BottomSheet, Button, Icon, PressableScale, Segmented, SheetScroll, Text, type IconName } from "@/shared/ui";
import { useToneColors } from "./kindStyle";

type Props = { visible: boolean; onClose: () => void; all: JournalEntry[]; filter: JournalFilter; onApply: (f: JournalFilter) => void };

// Filter sheet: «Turi» as a 2-column grid of icon tiles (multi-select, with counts) and the period. Edits are a draft
// until «Ko'rsatish · N» applies them; mount it with a fresh `key` per opening so the draft restarts from the filter.
export function JournalFilterSheet({ visible, onClose, all, filter, onApply }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const tone = useToneColors();
  const [draft, setDraft] = useState<JournalFilter>(filter);
  const counts = useMemo(() => countKinds(all, draft), [all, draft]);
  const n = useMemo(() => filterJournal(all, draft).length, [all, draft]);
  const total = JOURNAL_KINDS.reduce((s, k) => s + counts[k], 0);
  const periods = JOURNAL_PERIODS.map((p) => ({ value: p, label: t(p === "all" ? "secUx.all" : p === "today" ? "secUx.today" : p === "7d" ? "secUx.p7" : "secUx.p30") }));

  const tile = (id: string, icon: IconName, label: string, count: number, on: boolean, fg: string, bg: string, press: () => void) => (
    <PressableScale key={id} onPress={press} accessibilityRole="checkbox" accessibilityLabel={`${label}, ${count}`} accessibilityState={{ checked: on }} style={{ width: "48%", minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, borderRadius: radius.r, borderWidth: 1.5, borderColor: on ? c.accent : c.line, backgroundColor: on ? c.tint2 : c.surface }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={16} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="small" weight="semibold" numberOfLines={1}>{label}</Text>
        <Text variant="caption" tone="gray">{count}</Text>
      </View>
    </PressableScale>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("secUx.filter")} snaps={[0.82]}>
      <SheetScroll contentContainerStyle={{ gap: 20 }}>
        <View style={{ gap: 10 }}>
          <Text variant="small" weight="bold" tone="gray">{t("secUx.kindsTitle")}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
            {tile("all", "layers", t("secUx.all"), total, draft.kinds.length === 0, c.accent, c.tint2, () => setDraft({ ...draft, kinds: [] }))}
            {JOURNAL_KINDS.map((k: JournalKind) => {
              const tc = tone(k);
              return tile(k, kindIcon(k), t(`secUx.kind.${k}`), counts[k], draft.kinds.includes(k), tc.fg, tc.bg, () => setDraft({ ...draft, kinds: toggleKind(draft.kinds, k) }));
            })}
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="small" weight="bold" tone="gray">{t("secUx.periodTitle")}</Text>
          <Segmented<JournalPeriod> options={periods} value={draft.period} onChange={(period) => setDraft({ ...draft, period })} />
        </View>
      </SheetScroll>
      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 18, paddingTop: 12, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface }}>
        <Button title={t("secUx.clear")} variant="line" onPress={() => setDraft({ ...draft, kinds: [], period: "all" })} style={{ flex: 1 }} />
        <Button title={t("secUx.show", { n })} onPress={() => { onApply(draft); onClose(); }} style={{ flex: 2 }} />
      </View>
    </BottomSheet>
  );
}
