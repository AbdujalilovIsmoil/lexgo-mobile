import { StyleSheet, View } from "react-native";
import { executorKey, type Service } from "@/entities/service";
import { Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Title and the small facts that decide whether this is the right service.
export function ServiceHead({ service }: { service: Service }) {
  const { t } = useT();
  const ex = executorKey(service.executorType);
  return (
    <View style={s.col}>
      <Text variant="h3">{service.name}</Text>
      <View style={s.pills}>
        {service.categoryTitle ? <Pill label={service.categoryTitle} tone="blue" small /> : null}
        {service.subcategory ? <Pill label={service.subcategory} tone="gray" small /> : null}
        {ex ? <Pill label={t(`dc1.executor.${ex}`)} tone="cy" small icon="user" /> : null}
        {service.advokatRequired ? <Pill label={t("svc.detail.advokat")} tone="warn" icon="shield" small /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 8 }, pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 } });
