import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { secKeys } from "@/entities/security";
import { useInsets } from "@/shared/lib/insets";
import { AppLockCard } from "./AppLockCard";
import { DeleteAccountCard } from "./DeleteAccountCard";
import { NotifPrefsCard } from "./NotifPrefsCard";
import { TelegramCard } from "./TelegramCard";
import { TwoFactorCard } from "./TwoFactorCard";

// "Protection" tab: 2FA, Telegram link, app lock, notification preferences and account deletion; pull to refresh re-reads them.
export function ProtectionTab() {
  const insets = useInsets();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([qc.invalidateQueries({ queryKey: secKeys.profile }), qc.invalidateQueries({ queryKey: secKeys.prefs })]);
    setRefreshing(false);
  };
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 14 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TwoFactorCard />
      <TelegramCard />
      <AppLockCard />
      <NotifPrefsCard />
      <DeleteAccountCard />
    </ScrollView>
  );
}
