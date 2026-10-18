import { useEffect } from "react";
import { useRouter } from "expo-router";
import { openInstructor } from "@/features/instructor";

// `/instructor` (deep link, other screens' "Ask the assistant" buttons): opens the assistant sheet over the
// screen the user came from, then leaves — the sheet is the one and only assistant UI.
export function InstructorPage() {
  const router = useRouter();
  useEffect(() => {
    openInstructor();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);
  return null;
}
