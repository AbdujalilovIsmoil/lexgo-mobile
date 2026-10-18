import { useRouter } from "expo-router";
import { View } from "react-native";
import { aiTheme } from "@/shared/theme";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { classifyAgentAnswer } from "../../lib/agentAnswer";

export type Agent = { interactive: boolean; onAsk: (q: string) => void; onRetry: () => void };

// Under a legal-agent answer: "Qayta urinish" when lex.uz / the service failed (latest answer only) and the
// "Hujjat so'rovi yaratish" shortcut when the answer is about ordering a document.
export function AgentFoot({ text, agent }: { text: string; agent: Agent }) {
  const { t } = useT();
  const router = useRouter();
  const kind = classifyAgentAnswer(text);
  const retry = agent.interactive && (kind === "lex_unavailable" || kind === "error");
  if (!retry && kind !== "document_request") return null;
  return (
    <View style={{ flexDirection: "row", marginTop: 4 }}>
      {retry ? <Button title={t("cxAgent.retry")} icon="refresh-cw" variant="glass" size="sm" onPress={agent.onRetry} /> : null}
      {kind === "document_request" ? <Button title={t("cxAi.createDocRequest")} icon="file-text" size="sm" onPress={() => router.push("/services")} style={{ backgroundColor: aiTheme.accent }} /> : null}
    </View>
  );
}
