import { Segmented, type IconName } from "@/shared/ui";
import { useThemeStore, type ThemeMode } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const MODES: { value: ThemeMode; icon: IconName; key: string }[] = [
  { value: "light", icon: "sun", key: "profile.themeLight" },
  { value: "dark", icon: "moon", key: "profile.themeDark" },
  { value: "glass", icon: "droplet", key: "profile.themeGlass" },
];

// Light / dark / glass (the web's ThemeToggle without "system", plus the app's glass theme) — the thumb glides.
export function ThemeSegment() {
  const { t } = useT();
  const { mode, setMode } = useThemeStore();
  return <Segmented value={mode} onChange={setMode} options={MODES.map((m) => ({ value: m.value, icon: m.icon, label: t(m.key) }))} />;
}
