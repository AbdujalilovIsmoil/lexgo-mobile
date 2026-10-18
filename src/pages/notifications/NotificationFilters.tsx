import { View } from "react-native";
import { NOTIF_CATEGORIES } from "@/entities/notification";
import { useT } from "@/shared/i18n";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { Segmented, Text } from "@/shared/ui";
import type { CatFilter } from "./useFeed";

type Props = {
  cat: CatFilter;
  onCat: (c: CatFilter) => void;
  onlyUnread: boolean;
  onUnread: (v: boolean) => void;
  counts: Record<string, number>;
  onlyRead: boolean;
  onRead: (v: boolean) => void;
  total: number;
  text: string;
  onText: (v: string) => void;
};

type Seen = "all" | "unread" | "read";

// Summary line, search, category chips (with the unread count of each) and one sliding switch for
// All / Unread / Read (it drives the same two flags as before: unread-only and read-only).
export function NotificationFilters({ cat, onCat, onlyUnread, onUnread, counts, onlyRead, onRead, total, text, onText }: Props) {
  const { t } = useT();
  const options = [{ value: "all" as CatFilter, label: t("nt1.all"), count: total || undefined }, ...NOTIF_CATEGORIES.map((c) => ({ value: c as CatFilter, label: t(`nt1.cats.${c}`), count: counts[c] || undefined }))];
  const seen: Seen = onlyUnread ? "unread" : onlyRead ? "read" : "all";
  const setSeen = (v: Seen) => { onUnread(v === "unread"); onRead(v === "read"); };
  return (
    <View style={{ gap: 12, paddingBottom: 10 }}>
      <Text variant="small" tone="gray" style={{ paddingHorizontal: 16 }}>{total ? t("ntd.unreadN", { n: total }) : t("ntd.allRead")}</Text>
      <SearchBox value={text} onChangeText={onText} placeholder={t("nt1.search")} />
      <ChipBar options={options} value={cat} onChange={onCat} />
      <View style={{ paddingHorizontal: 16 }}>
        <Segmented<Seen> options={[{ value: "all", label: t("ntd.all") }, { value: "unread", label: t("nt1.onlyUnread"), icon: "eye-off" }, { value: "read", label: t("nt1.onlyRead"), icon: "check" }]} value={seen} onChange={setSeen} />
      </View>
    </View>
  );
}
