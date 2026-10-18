import { Stack, useLocalSearchParams } from "expo-router";
import { EditorScreen } from "@/widgets/doc-queue";

// /pro/docs/[id]/editor — source choice and the OnlyOffice editor. The edge-swipe back gesture is off:
// it would fight with scrolling and selecting inside the document.
export default function DocEditorPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <EditorScreen id={String(id)} />
    </>
  );
}
