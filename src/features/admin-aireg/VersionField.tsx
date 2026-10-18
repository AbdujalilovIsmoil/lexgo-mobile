import { View } from "react-native";
import { cleanVersion, nextVersion } from "@/entities/admin-aireg";
import { Chip, Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Version input with one-tap "minor edit" / "major change" suggestions computed from the current version.
export function VersionField({ value, onChange, current, error }: { value: string; onChange: (v: string) => void; current: string; error?: string }) {
  const { t } = useT();
  const minor = current ? nextVersion(current, "minor") : "";
  const major = current ? nextVersion(current, "major") : "";
  return (
    <View style={{ gap: 8 }}>
      <Input label={t("admAiRegB.version")} value={value} onChangeText={(v) => onChange(cleanVersion(v))} keyboardType="decimal-pad" placeholder={minor || "1.0"} hint={current ? t("admAiRegB.versionCurrent", { v: current }) : t("admAiRegB.versionHint")} error={error} />
      {current ? (
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Chip label={`${minor} · ${t("admAiRegD.bumpMinor")}`} active={value === minor} onPress={() => onChange(minor)} />
          <Chip label={`${major} · ${t("admAiRegD.bumpMajor")}`} active={value === major} onPress={() => onChange(major)} />
        </View>
      ) : null}
    </View>
  );
}
