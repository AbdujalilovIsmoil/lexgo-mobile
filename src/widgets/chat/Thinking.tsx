import { useEffect, useState } from "react";
import { TypingDots } from "@/entities/chat";
import { useT } from "@/shared/i18n";

// The wait for an answer can reach a minute: after a while say so instead of looking frozen.
export function Thinking() {
  const { t } = useT();
  const [long, setLong] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLong(true), 15_000);
    return () => clearTimeout(id);
  }, []);
  return <TypingDots label={t(long ? "ax1.longWait" : "ai.thinking")} />;
}
