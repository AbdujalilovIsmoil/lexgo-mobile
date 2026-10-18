import { View } from "react-native";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { StudioConstructor } from "@/entities/admin-studio";

// What kind of constructor this is: code, whether approval is needed, required fields, where it publishes to.
export function CtorInfo({ code, ctor }: { code: string; ctor: StudioConstructor | null }) {
  const { t } = useT();
  const free = ctor ? !ctor.approvalRequired : code === "K16";
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Pill label={code} tone="gray" small />
      <Pill label={t(free ? "admStudio.list.free" : "admStudio.list.approval")} tone={free ? "ok" : "blue"} icon={free ? "zap" : "shield"} small />
      {ctor?.required.length ? <Pill label={t("admStudio.list.required", { n: ctor.required.length })} tone="gray" icon="clipboard" small /> : null}
      {ctor?.runtime ? <Pill label={ctor.runtime} tone="gray" icon="layers" small /> : null}
    </View>
  );
}
