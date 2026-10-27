import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { BASE_SCOPE, type RaPerson } from "@/entities/remote-assist";
import { supKeys, ticketTitle } from "@/entities/support";
import { getTicket } from "@/entities/support/api/ticketApi";
import { Avatar, Icon, Text, Toggle, type IconName } from "@/shared/ui";
import { mmss } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { scopeName } from "./names";

const SCOPE_ICON: Record<string, IconName> = {
  view_page_context: "eye", highlight: "crosshair", navigate: "compass", scroll: "chevrons-down", tooltip: "message-square", focus: "edit-3",
  form_fill: "edit", form_select: "list", form_toggle: "toggle-right", open_modal: "maximize-2", step_navigation: "skip-forward",
  personal_form_fill: "user", prepare_draft: "file-text", present_confirmation: "check-square",
};

/** Who asks: the operator's name and LexGo id, and the time left to answer (hidden once it ran out on this phone's clock). */
export function OperatorHead({ person, left }: { person: RaPerson; left: number }) {
  const { t } = useT();
  const c = useColors();
  const name = person.name || t("ra.operator");
  return (
    <View style={s.row}>
      <Avatar name={name} size={46} />
      <View style={s.fill}>
        <Text variant="h4" numberOfLines={1}>{name}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{person.lexgoId ? `${t("ra.fromSupport")} · ${t("ra.lexgoId", { id: person.lexgoId })}` : t("ra.fromSupport")}</Text>
      </View>
      {left > 0 ? (
        <View style={[s.timer, { backgroundColor: c.warnBg }]} accessibilityLabel={`${t("ra.expires")}: ${mmss(left)}`}>
          <Icon name="clock" size={14} color={c.warn} />
          <Text variant="small" weight="bold" style={{ color: c.warn }}>{mmss(left)}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** The support ticket the request belongs to, and the operator's reason. */
export function TicketFact({ ticketId, reason }: { ticketId: string; reason: string }) {
  const { t } = useT();
  const c = useColors();
  const q = useQuery({ queryKey: supKeys.ticket(ticketId), queryFn: () => getTicket(ticketId), enabled: !!ticketId, retry: false, staleTime: 60_000 });
  const tk = q.data;
  const head = tk ? [tk.workId ? `#${tk.workId}` : "", ticketTitle(tk, "")].filter(Boolean).join(" · ") : "";
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <Icon name="headphones" size={18} color={c.accent} />
      <View style={s.fill}>
        <Text variant="caption" tone="gray">{t("ra.ticket")}</Text>
        <Text variant="small" weight="semibold" numberOfLines={2}>{head || t("ra.ticketPlain")}</Text>
        {reason ? <Text variant="small" tone="gray">«{reason}»</Text> : null}
      </View>
    </View>
  );
}

/** An icon, a bold line and a lighter one, on a soft fill. */
export function Fact({ icon, title, text, strong }: { icon: IconName; title: string; text?: string; strong?: boolean }) {
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: strong ? c.tint : c.surface2 }]}>
      <Icon name={icon} size={18} color={strong ? c.accentStrong : c.accent} />
      <View style={s.fill}>
        <Text variant="small" weight="semibold">{title}</Text>
        {text ? <Text variant="small" tone="gray">{text}</Text> : null}
      </View>
    </View>
  );
}

/** Exactly the requested scopes in plain words; each optional one has its own switch (seeing the page is part of any help). */
export function ScopeRows({ scopes, off, onFlip }: { scopes: string[]; off: ReadonlySet<string>; onFlip: (scope: string, on: boolean) => void }) {
  const { t } = useT();
  const c = useColors();
  const list = [...new Set(scopes)];
  return (
    <View style={[s.list, { borderColor: c.line }]}>
      <Text variant="small" weight="bold" style={s.listHead}>{t("ra.scopesTitle")}</Text>
      {list.map((sc) => {
        const label = scopeName(t, sc);
        return (
          <View key={sc} style={s.scope}>
            <Icon name={SCOPE_ICON[sc] ?? "shield"} size={17} color={c.accent} />
            <Text variant="small" style={s.fill}>{label}</Text>
            {sc === BASE_SCOPE ? <Text variant="caption" tone="gray">{t("ra.always")}</Text> : <Toggle value={!off.has(sc)} onChange={(v) => onFlip(sc, v)} label={label} />}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1, gap: 2 },
  timer: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, height: 30, borderRadius: radius.pill },
  box: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: radius.r },
  list: { borderWidth: 1, borderRadius: radius.r, paddingHorizontal: 12, paddingBottom: 4 },
  listHead: { paddingTop: 12, paddingBottom: 4 },
  scope: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 },
});
