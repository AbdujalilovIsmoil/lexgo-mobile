import { View } from "react-native";
import { IncludeList, type ServicePackage } from "@/entities/package";
import { BottomSheet, SheetScroll } from "@/shared/ui/sheet";
import { Button, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";

type Props = { pkg: ServicePackage | null; onClose: () => void; onOrder: (p: ServicePackage) => void };

// "Batafsil": price, duration, category, service codes, result, everything included / excluded, order button.
export function PackageSheet({ pkg: p, onClose, onOrder }: Props) {
  const { t } = useT();
  return (
    <BottomSheet visible={!!p} onClose={onClose} title={p ? `${p.title} · ${p.tariff}` : ""}>
      {p ? (
        <SheetScroll>
          <FactRows rows={[
            { label: t("mk8.price"), value: `${fmtMoney(p.price)} ${t("mk8.som")}` },
            { label: t("mk8.duration"), value: p.duration || "—" },
            { label: t("mk8.category"), value: p.categoryTitle || "—" },
            { label: t("mk8.services"), value: p.relatedServiceCodes || "—" },
          ]} />
          {p.result ? <View style={{ gap: 2 }}><Text variant="small" weight="bold">{t("mk8.result")}</Text><Text variant="small" tone="gray">{p.result}</Text></View> : null}
          <Text variant="body" weight="bold">{t("mk8.included")}</Text>
          <IncludeList included={p.included} excluded={[]} />
          {p.excluded.length ? <><Text variant="body" weight="bold">{t("mk8.excluded")}</Text><IncludeList included={[]} excluded={p.excluded} /></> : null}
          <Button title={t("mk8.order")} onPress={() => onOrder(p)} full />
        </SheetScroll>
      ) : null}
    </BottomSheet>
  );
}
