import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useComplaintForm, useComplaintSent } from "@/features/rating";
import { AdminPage } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { SheetActions } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";

// /complaints/new — a new complaint on its own page (it used to be a bottom sheet): the fields scroll, Cancel / Send stay on the bar at the
// foot. Sent → back to where it was opened, the complaints list shows the "sent" note for it.
export function NewComplaintPage({ about = "" }: { about?: string }) {
  const { t } = useT();
  const router = useRouter();
  const leave = () => (router.canGoBack() ? router.back() : router.replace("/complaints"));
  const form = useComplaintForm(about, (c) => {
    useComplaintSent.getState().set(c.workId);
    toast(t("pwc.sent"), "ok");
    leave();
  });
  return (
    <AdminPage title={t("pwc.new")} footer={<SheetActions cancel={{ label: t("pwc.cancel"), onPress: leave }} submit={{ label: t("pwc.submit"), onPress: form.submit, loading: form.pending }} />}>
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
        {form.fields}
      </KeyboardAwareScrollView>
    </AdminPage>
  );
}

const s = StyleSheet.create({ body: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 } });
