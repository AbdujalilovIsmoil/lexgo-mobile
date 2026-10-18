import { Card, Icon, Text } from "@/shared/ui";
import { View } from "react-native";
import { useStudioText, type StudioField } from "@/entities/admin-studio";
import { humanizeSlug } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";

// "Fix these first": every field with an error and what is wrong with it.
export function ErrorSummary({ errors, ctorFields }: { errors: Record<string, string>; ctorFields: StudioField[] }) {
  const { t, fieldErr } = useStudioText();
  const c = useColors();
  const list = Object.entries(errors).filter(([, v]) => v);
  if (!list.length) return null;
  const label = (k: string) => {
    if (k === "_") return t("admStudioB.errors.general");
    const root = k.split(".")[0];
    const f = ctorFields.find((x) => x.key === root)?.label || humanizeSlug(root);
    return k === root ? f : `${f} · ${k.slice(root.length + 1)}`;
  };
  return (
    <Card style={{ gap: 6, borderColor: c.err }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Icon name="alert-triangle" size={18} color={c.err} />
        <Text variant="small" weight="bold" style={{ color: c.err }}>{t("admStudioB.errors.title", { n: list.length })}</Text>
      </View>
      {list.slice(0, 12).map(([k, v]) => <Text key={k} variant="caption" tone="gray"><Text variant="caption" weight="bold">{label(k)}: </Text>{fieldErr(v)}</Text>)}
    </Card>
  );
}
