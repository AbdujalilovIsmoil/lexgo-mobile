import { StyleSheet, View } from "react-native";
import { ServiceList, useServiceSearch, type Service } from "@/entities/service";
import { useDebounced } from "@/shared/lib/useDebounced";
import { Icon, Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { q: string; onChange: (v: string) => void; onPick: (s: Service) => void };

// Search field + live results (GET /services/search) from 2 characters on.
export function ServiceSearch({ q, onChange, onPick }: Props) {
  const { t } = useT();
  const typed = useDebounced(q, 400);
  const { data, isFetching } = useServiceSearch(typed);
  const active = q.trim().length >= 2;
  const waiting = q.trim() !== typed.trim() || (isFetching && !data);
  return (
    <View style={s.wrap}>
      <Input placeholder={t("services.searchPh")} value={q} onChangeText={onChange} left={<Icon name="search" size={18} tone="gray" />} returnKeyType="search" clearButtonMode="while-editing" />
      {active ? <ServiceList services={data} loading={waiting} onPick={onPick} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
});
