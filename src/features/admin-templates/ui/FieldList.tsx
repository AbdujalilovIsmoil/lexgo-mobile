import { View } from "react-native";
import { Text } from "@/shared/ui";
import type { TemplateField } from "@/entities/admin-templates";
import { useT } from "@/shared/i18n";

// Detected placeholders: {{key}}, label and type (a star marks required ones).
export function FieldList({ fields }: { fields: TemplateField[] }) {
  const { t } = useT();
  return (
    <View style={{ gap: 6 }}>
      {fields.map((f) => (
        <Text key={f.key} variant="small" selectable>
          <Text variant="small" weight="bold" tone="accent">{`{{${f.key}}}`}</Text>
          {` — ${f.label} · ${t(`admTplB.types.${f.type}`) === `admTplB.types.${f.type}` ? f.type : t(`admTplB.types.${f.type}`)}${f.required ? " *" : ""}`}
        </Text>
      ))}
    </View>
  );
}
