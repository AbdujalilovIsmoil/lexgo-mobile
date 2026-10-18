import { Redirect, useLocalSearchParams } from "expo-router";

// The old profile drawer is gone: links and deep links to /lawyer/<id> open the specialist's own page.
export default function Screen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  return <Redirect href={{ pathname: "/specialist/[id]", params: { id: String(id), ...(tab ? { tab: String(tab) } : {}) } }} />;
}
