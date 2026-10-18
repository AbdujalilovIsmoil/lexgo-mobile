import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { File } from "expo-file-system";
import { useColors } from "@/shared/theme";
import { Text } from "../Text";
import { OtherView } from "./OtherView";

const MAX = 400_000;

// txt / csv / json / md: read as text and shown selectable (the first 400 000 characters of a very long file).
export function TextView({ uri, name, mime }: { uri: string; name: string; mime?: string }) {
  const c = useColors();
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    new File(uri).text().then((v) => alive && setText(v.length > MAX ? v.slice(0, MAX) : v)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [uri]);
  if (failed) return <OtherView uri={uri} name={name} mime={mime} />;
  if (text === null) return <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />;
  return <ScrollView contentContainerStyle={{ padding: 16 }}><Text variant="small" selectable>{text}</Text></ScrollView>;
}
