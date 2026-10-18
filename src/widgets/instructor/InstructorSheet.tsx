import { useEffect } from "react";
import { useRouter } from "expo-router";
import { closeInstructor, useInstructorUi } from "@/features/instructor";

// Every "open the assistant" call (floating orb, /instructor deep link, buttons on other screens) raises the
// same flag; it is turned into a push of the full-screen assistant, so there is one assistant UI.
export function InstructorSheet() {
  const router = useRouter();
  const open = useInstructorUi((s) => s.open);
  useEffect(() => {
    if (!open) return;
    closeInstructor();
    router.push("/assistant" as never);
  }, [open, router]);
  return null;
}
