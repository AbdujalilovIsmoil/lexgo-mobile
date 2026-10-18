import { Redirect, useLocalSearchParams } from "expo-router";

// /support/new?topic=…&q=…&force=1 (old links) -> the hub with its new-chat window open, like web `?new=1`.
export default function SupportNewPage() {
  const p = useLocalSearchParams<{ topic?: string; q?: string; force?: string }>();
  return <Redirect href={{ pathname: "/support", params: { ...p, new: "1" } } as never} />;
}
