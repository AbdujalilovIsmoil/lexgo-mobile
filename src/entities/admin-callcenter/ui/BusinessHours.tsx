import { useEffect, useState } from "react";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Call-center hours: Mon–Sat 09:00–19:00, Asia/Tashkent (UTC+5, no DST). Holidays are not taken into account.
function state(): "open" | "closed" | "dayOff" {
  const now = new Date(Date.now() + 5 * 3_600_000);
  const day = now.getUTCDay();
  const h = now.getUTCHours();
  if (day === 0) return "dayOff";
  return h >= 9 && h < 19 ? "open" : "closed";
}

export function BusinessHours() {
  const { t } = useT();
  const [s, setS] = useState(state);
  useEffect(() => {
    const id = setInterval(() => setS(state()), 30_000);
    return () => clearInterval(id);
  }, []);
  return <Pill small tone={s === "open" ? "ok" : s === "closed" ? "warn" : "gray"} icon="clock" label={t(`admCcC.hours.${s}`)} />;
}
