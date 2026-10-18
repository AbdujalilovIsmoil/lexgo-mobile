import type { ReactNode } from "react";
import { SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useStudioText } from "@/entities/admin-studio";

type Props = { title: string; hint?: string; count?: number; error?: string; action?: { label: string; onPress: () => void }; children: ReactNode };

// A titled block of an editor (sections, rules, items …) with its own error line.
export function Block({ title, hint, count, error, action, children }: Props) {
  const { fieldErr } = useStudioText();
  return (
    <SectionCard title={count != null ? `${title} · ${count}` : title} action={action}>
      {hint ? <Text variant="caption" tone="gray">{hint}</Text> : null}
      {error ? <Text variant="caption" tone="err">{fieldErr(error)}</Text> : null}
      {children}
    </SectionCard>
  );
}
